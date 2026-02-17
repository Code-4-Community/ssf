import {
  Button,
  Text,
  Flex,
  Box,
  Table,
  Input,
  TableCaption,
  Stack,
  Dialog,
  NativeSelect,
  NativeSelectIndicator,
  Portal,
  Checkbox,
  Menu,
  NumberInput,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import ApiClient from '@api/apiClient';
import { FoodType, FoodTypes, RecurrenceEnum } from '../../types/types';
import { Minus } from 'lucide-react';

interface NewDonationFormModalProps {
  onDonationSuccess: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const NewDonationFormModal: React.FC<NewDonationFormModalProps> = ({
  onDonationSuccess,
  isOpen,
  onClose,
}) => {
  enum RepeatEnum {
    NONE = 'None',
    WEEK = 'Week',
    MONTH = 'Month',
    YEAR = 'Year',
  }

  const RECURRENCE_MAP: Record<RepeatEnum, RecurrenceEnum> = {
    [RepeatEnum.NONE]: RecurrenceEnum.NONE,
    [RepeatEnum.WEEK]: RecurrenceEnum.WEEKLY,
    [RepeatEnum.MONTH]: RecurrenceEnum.MONTHLY,
    [RepeatEnum.YEAR]: RecurrenceEnum.YEARLY,
  };

  const [rows, setRows] = useState([
    {
      id: 1,
      foodItem: '',
      foodType: '',
      numItems: '',
      ozPerItem: '',
      valuePerItem: '',
      foodRescue: false,
    },
  ]);

  const [isRecurring, setIsRecurring] = useState(false);
  // Defaults for the recurring section
  const [repeatEvery, setRepeatEvery] = useState('1');
  const [repeatInterval, setRepeatInterval] = useState<RepeatEnum>(RepeatEnum.NONE);
  const [repeatOn, setRepeatOn] = useState({
    Monday: false,
    Tuesday: false,
    Wednesday: true,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });
  const [endsAfter, setEndsAfter] = useState('1');

  // Totals accumulated from the item rows
  const [totalItems, setTotalItems] = useState(0);
  const [totalOz, setTotalOz] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  // Adjust the appropriate field in a row and recalculate totals if needed
  const handleChange = (id: number, field: string, value: string | boolean) => {
    const updatedRows = rows.map((row) =>
      row.id === id ? { ...row, [field]: value } : row,
    );

    setRows(updatedRows);
    calculateTotals(updatedRows);
  };

  // Calculate totals based on the current rows
  const calculateTotals = (updatedRows: typeof rows) => {
    let totalItems = 0,
      totalOz = 0,
      totalValue = 0;

    updatedRows.forEach((row) => {
      if (row.numItems && row.ozPerItem && row.valuePerItem) {
        const qty = parseInt(row.numItems);
        totalItems += qty;
        totalOz += parseFloat(row.ozPerItem) * qty;
        totalValue += parseFloat(row.valuePerItem) * qty;
      }
    });

    setTotalItems(totalItems);
    setTotalOz(parseFloat(totalOz.toFixed(2)));
    setTotalValue(parseFloat(totalValue.toFixed(2)));
  };

  // Adjust the repeatOn state for weekly recurrence when a day is toggled
  const handleDayToggle = (day: string) => {
    setRepeatOn((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  // Create a new row with all null values
  const addRow = () => {
    setRows([
      ...rows,
      {
        // Unique id for the row to keep track of them throughout changes
        id: Date.now(),
        foodItem: '',
        foodType: '',
        numItems: '',
        ozPerItem: '',
        valuePerItem: '',
        foodRescue: false,
      },
    ]);
  };

  // Filter out the row with the matching id and recalculate totals
  const deleteRow = (id: number) => {
    if (rows.length > 1) {
      const newRows = rows.filter((r) => r.id !== id);
      setRows(newRows);
      calculateTotals(newRows);
    }
  };

  const generateNextDonationDates = (): string[] => {
    const today = new Date();
    const repeatCount = parseInt(repeatEvery);
    const dates: string[] = [];

    // For weeks, use the repeatCount and selected days to calculate the next dates
    if (repeatInterval === RepeatEnum.WEEK) {
      const selectedDays = Object.keys(repeatOn).filter((day) => repeatOn[day]);
      if (selectedDays.length === 0) return [];

      const dayOfWeek = today.getDay();
      const daysOfWeek = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];

      // Calculate the start of the next occurrence window
      const baseWeeksToAdd = repeatCount;
      const baseDaysToAdd = baseWeeksToAdd * 7;

      // If repeat is more than 1 week OR no days found this week, start from next interval
      const startDay = repeatCount > 1 ? baseDaysToAdd : 1;

      // Collect all matching days in the next occurrence window
      for (let i = startDay; i <= startDay + 6; i++) {
        const nextDayIndex = (dayOfWeek + i) % 7;
        const nextDay = daysOfWeek[nextDayIndex];

        if (selectedDays.includes(nextDay)) {
          const nextDate = new Date(today);
          nextDate.setDate(today.getDate() + i);
          // Default the time to now
          nextDate.setHours(
            today.getHours(),
            today.getMinutes(),
            today.getSeconds(),
            today.getMilliseconds(),
          );
          dates.push(nextDate.toISOString());
        }
      }
    } else if (repeatInterval === RepeatEnum.MONTH) {
      const nextDate = new Date(today);
      nextDate.setMonth(today.getMonth() + repeatCount);
      nextDate.setHours(
        today.getHours(),
        today.getMinutes(),
        today.getSeconds(),
        today.getMilliseconds(),
      );
      dates.push(nextDate.toISOString());
    } else if (repeatInterval === RepeatEnum.YEAR) {
      const nextDate = new Date(today);
      nextDate.setFullYear(today.getFullYear() + repeatCount);
      nextDate.setHours(
        today.getHours(),
        today.getMinutes(),
        today.getSeconds(),
        today.getMilliseconds(),
      );
      dates.push(nextDate.toISOString());
    }

    return dates;
  };

  // Get the specific text display for the next donation date based on the selected recurrence pattern
  const getNextDonationDateDisplay = (): string => {
    const dates = generateNextDonationDates();
    if (dates.length === 0) return '';

    const firstDate = new Date(dates[0]);
    return firstDate.toLocaleDateString('en-US', {
      weekday: 'long', // Full name
      year: 'numeric', // Year
      month: 'long', // Full month name
      day: 'numeric', // Day of the month
    });
  };

  const getSelectedDaysText = () => {
    const selected = Object.keys(repeatOn).filter((day) => repeatOn[day]);
    if (selected.length === 0) return 'Select days';
    if (selected.length === 1) return selected[0];
    if (selected.length <= 4) return selected.join(', ');
    if (selected.length > 4)
      return `${selected.slice(0, 4).join(', ')} + ${selected.length - 4}`;
    return `${selected.length} days selected`;
  };

  const handleSubmit = async () => {
    // Ensure all fields are filled in
    const hasEmpty = rows.some(
      (row) =>
        !row.foodItem ||
        !row.foodType ||
        !row.numItems ||
        !row.ozPerItem ||
        !row.valuePerItem,
    );
    if (hasEmpty) {
      alert('Please fill in all fields before submitting.');
      return;
    }

    // Create the donation first
    const nextDonationDates = isRecurring ? generateNextDonationDates() : null;

    // Alert the user for recurring donations that do not have another donation date scheduled
    if (nextDonationDates && nextDonationDates.length === 0) {
      alert('Please select at least one day for weekly recurrence.');
      return;
    }

    const donation_body = {
      foodManufacturerId: 1, // TODO: Change this to the proper id of the logged in user's food manufacturer
      totalItems,
      totalOz,
      totalEstimatedValue: totalValue,
      recurrence: RECURRENCE_MAP[repeatInterval],
      recurrenceFreq: isRecurring ? parseInt(repeatEvery) : null,
      nextDonationDates: nextDonationDates,
      occurrencesRemaining: isRecurring ? parseInt(endsAfter) : null,
    };

    // Submit all donation items at once
    try {
      const donationResponse = await ApiClient.postDonation(donation_body);
      const donationId = donationResponse?.donationId;

      if (donationId) {
        const items = rows.map((row) => ({
          itemName: row.foodItem,
          quantity: parseInt(row.numItems),
          reservedQuantity: 0,
          ozPerItem: parseFloat(row.ozPerItem),
          estimatedValue: parseFloat(row.valuePerItem),
          foodType: row.foodType as FoodType,
          foodRescue: row.foodRescue,
        }));

        await ApiClient.postMultipleDonationItems({ donationId, items });
        onDonationSuccess();

        setRows([
          {
            id: 1,
            foodItem: '',
            foodType: '',
            numItems: '',
            ozPerItem: '',
            valuePerItem: '',
            foodRescue: false,
          },
        ]);
        setTotalItems(0);
        setTotalOz(0);
        setTotalValue(0);
        setIsRecurring(false);
        setRepeatInterval(RepeatEnum.NONE);
        onClose();
      } else {
        alert('Failed to submit donation');
      }
    } catch (error) {
      alert('Error submitting new donation: ' + error);
    }
  };

  const isRepeatOnDisabled = repeatInterval !== RepeatEnum.WEEK;

  return (
    <Dialog.Root
      open={isOpen}
      size="md"
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) onClose();
      }}
      closeOnInteractOutside
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="75vw" maxH="90vh">
            <Dialog.CloseTrigger />

            <Dialog.Header asChild>
              <Dialog.Title fontSize={18} fontWeight={600}>
                Log New Donation
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Text mb={8} color="neutral.700">
                Please fill out the following information to record donation
                details.
              </Text>

              <Box display="block" overflowX="auto" whiteSpace="nowrap">
                <Table.Root variant="line" size="md">
                  <TableCaption textAlign="left">
                    <Stack
                      direction="column"
                      align="flex-start"
                      gap={14}
                      mt={4}
                    >
                      <Button
                        display="inline-flex"
                        alignItems="center"
                        bg="white"
                        color="neutral.800"
                        fontWeight={600}
                        fontSize={14}
                        borderRadius={4}
                        borderColor="neutral.200"
                        onClick={addRow}
                      >
                        Add New Row +
                      </Button>
                      <Checkbox.Root
                        checked={isRecurring}
                        onCheckedChange={(e) => {
                          // Handles the case of we make edits to make donation recurring, but uncheck it afterwards
                          // in which case it should go back to none rather than keeping the last selected interval
                          if (e.checked) {
                            setRepeatInterval(RepeatEnum.WEEK);
                          } else {
                            setRepeatInterval(RepeatEnum.NONE);
                          }
                          setIsRecurring(e.checked);
                        }}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Label color="neutral.700">
                          Make Donation Recurring
                        </Checkbox.Label>
                      </Checkbox.Root>
                    </Stack>
                  </TableCaption>

                  <Table.Header>
                    <Table.Row fontWeight={600}>
                      <Table.ColumnHeader
                        width="35px"
                        p={0}
                      ></Table.ColumnHeader>
                      <Table.ColumnHeader width="22%">
                        Food Item
                        <Text as="span" color="red">
                          *
                        </Text>
                      </Table.ColumnHeader>
                      <Table.ColumnHeader width="22%">
                        Food Type
                        <Text as="span" color="red">
                          *
                        </Text>
                      </Table.ColumnHeader>
                      <Table.ColumnHeader width="14%">
                        Quantity
                        <Text as="span" color="red">
                          *
                        </Text>
                      </Table.ColumnHeader>
                      <Table.ColumnHeader width="14%">
                        Oz. per item
                      </Table.ColumnHeader>
                      <Table.ColumnHeader width="14%">
                        Donation Value
                      </Table.ColumnHeader>
                      <Table.ColumnHeader width="5%" textAlign="center" px={0}>
                        Food Rescue
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {rows.map((row) => (
                      <Table.Row key={row.id}>
                        <Table.Cell width="35px" px={0} pr={1}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteRow(row.id)}
                            disabled={rows.length === 1}
                            borderColor="neutral.300"
                            borderRadius="md"
                            bg="white"
                            _hover={{ bg: 'gray.50' }}
                            _disabled={{ opacity: 0.4, cursor: 'not-allowed' }}
                            width="32px"
                            height="32px"
                            minW="32px"
                            padding={0}
                          >
                            <Box color="neutral.300">
                              <Minus size={16} />
                            </Box>
                          </Button>
                        </Table.Cell>
                        <Table.Cell pl={1}>
                          <Input
                            _placeholder={{ color: 'neutral.300' }}
                            color='neutral.800'
                            placeholder="Enter Food"
                            value={row.foodItem}
                            size="md"
                            onChange={(e) =>
                              handleChange(row.id, 'foodItem', e.target.value)
                            }
                          />
                        </Table.Cell>

                        <Table.Cell>
                          <NativeSelect.Root size="md">
                            <NativeSelect.Field
                              color={
                                row.foodType ? 'neutral.800' : 'neutral.300'
                              }
                              placeholder="Select Type"
                              value={row.foodType}
                              onChange={(e) =>
                                handleChange(row.id, 'foodType', e.target.value)
                              }
                            >
                              {FoodTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </NativeSelect.Field>
                            <NativeSelectIndicator />
                          </NativeSelect.Root>
                        </Table.Cell>

                        <Table.Cell>
                          <Input
                            _placeholder={{ color: 'neutral.300' }}
                            color='neutral.800'
                            placeholder="Enter #"
                            type="number"
                            min={1}
                            size="md"
                            value={row.numItems}
                            onChange={(e) =>
                              handleChange(row.id, 'numItems', e.target.value)
                            }
                          />
                        </Table.Cell>

                        <Table.Cell>
                          <Input
                            _placeholder={{
                              color: 'neutral.300',
                            }}
                            color = 'neutral.800'
                            placeholder="Enter #"
                            type="number"
                            min={1}
                            size="md"
                            value={row.ozPerItem}
                            onChange={(e) =>
                              handleChange(row.id, 'ozPerItem', e.target.value)
                            }
                          />
                        </Table.Cell>

                        <Table.Cell>
                          <Input
                            _placeholder={{ color: 'neutral.300' }}
                            color='neutral.800'
                            placeholder="Enter $"
                            type="number"
                            min={1}
                            size="md"
                            value={row.valuePerItem}
                            onChange={(e) =>
                              handleChange(
                                row.id,
                                'valuePerItem',
                                e.target.value,
                              )
                            }
                          />
                        </Table.Cell>
                        <Table.Cell textAlign="center" px={0}>
                          <Checkbox.Root
                            checked={row.foodRescue}
                            size="lg"
                            onCheckedChange={(e) =>
                              handleChange(row.id, 'foodRescue', e.checked)
                            }
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control>
                              <Checkbox.Indicator />
                            </Checkbox.Control>
                          </Checkbox.Root>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>

              {isRecurring && (
                <Box mt={6} color="neutral.800" fontSize="sm">
                  <Stack
                    direction="row"
                    align="flex-start"
                    gap={4}
                    mb={4}
                    flexWrap="wrap"
                  >
                    <Box flex="1" minW="200px">
                      <Text fontWeight={600} mb={3}>
                        Repeat every
                      </Text>
                      <Flex gap={2} align="center">
                        <NumberInput.Root
                          width="98px"
                          value={repeatEvery}
                          onValueChange={(e) => setRepeatEvery(e.value)}
                          min={1}
                        >
                          <NumberInput.Input />
                          <NumberInput.Control />
                        </NumberInput.Root>
                        <NativeSelect.Root flex="1" size="md">
                          <NativeSelect.Field
                            value={repeatInterval}
                            onChange={(e) =>
                              setRepeatInterval(e.target.value as RepeatEnum)
                            }
                          >
                            {Object.values(RepeatEnum). filter((interval) => interval !== 'None'). map((interval) => (
                              <option key={interval} value={interval}>
                                {interval}
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelectIndicator />
                        </NativeSelect.Root>
                      </Flex>
                    </Box>

                    <Box flex="1" minW="236px" width="100%">
                      <Text fontWeight={600} mb={3}>
                        Repeat on
                      </Text>
                      <Menu.Root closeOnSelect={false}>
                        {!isRepeatOnDisabled && (
                          <Menu.Trigger asChild>
                            <Box cursor="pointer">
                              <NativeSelect.Root size="md">
                                <NativeSelect.Field
                                  value={getSelectedDaysText()}
                                  bg="white"
                                  readOnly
                                >
                                  <option color="neutral.800">
                                    {getSelectedDaysText()}
                                  </option>
                                </NativeSelect.Field>
                                <NativeSelectIndicator />
                              </NativeSelect.Root>
                            </Box>
                          </Menu.Trigger>
                        )}
                        {isRepeatOnDisabled && (
                          <Box cursor="not-allowed">
                            <NativeSelect.Root size="md">
                              <NativeSelect.Field
                                value={getSelectedDaysText()}
                                bg="white"
                                disabled
                                opacity={0.5}
                                readOnly
                                pointerEvents="none"
                              >
                                <option color="neutral.800">
                                  {getSelectedDaysText()}
                                </option>
                              </NativeSelect.Field>
                              <NativeSelectIndicator />
                            </NativeSelect.Root>
                          </Box>
                        )}
                        {!isRepeatOnDisabled && (
                          <Portal>
                            <Menu.Positioner>
                              <Menu.Content
                                minW="236px"
                                maxH="300px"
                                color="neutral.800"
                                zIndex={9999}
                              >
                                {Object.keys(repeatOn).map((day) => (
                                  <Menu.Item
                                    key={day}
                                    value={day}
                                    onClick={() => handleDayToggle(day)}
                                    p={2}
                                  >
                                    <Flex align="center" gap={2}>
                                      <Checkbox.Root
                                        checked={repeatOn[day]}
                                        pointerEvents="none"
                                      >
                                        <Checkbox.HiddenInput />
                                        <Checkbox.Control>
                                          <Checkbox.Indicator />
                                        </Checkbox.Control>
                                      </Checkbox.Root>
                                      <Text>{day}</Text>
                                    </Flex>
                                  </Menu.Item>
                                ))}
                              </Menu.Content>
                            </Menu.Positioner>
                          </Portal>
                        )}
                      </Menu.Root>
                    </Box>

                    <Box flex="1" minW="200px">
                      <Text fontWeight={600} mb={3} fontSize="sm">
                        Ends after
                      </Text>
                      <NumberInput.Root
                        width="100%"
                        value={endsAfter}
                        onValueChange={(e) => setEndsAfter(e.value)}
                        min={1}
                      >
                        <Flex position="relative" align="center">
                          <NumberInput.Input pl={4} pr="140px" fontSize="md" />
                          <Text
                            position="absolute"
                            left={`calc(16px + ${
                              endsAfter.length * 0.6
                            }em + 8px)`}
                            color="neutral.800"
                            fontSize="md"
                            pointerEvents="none"
                          >
                            {parseInt(endsAfter) > 1
                              ? 'Occurrences'
                              : 'Occurrence'}
                          </Text>
                          <NumberInput.Control />
                        </Flex>
                      </NumberInput.Root>
                    </Box>
                  </Stack>
                  {(repeatInterval === RepeatEnum.WEEK
                    ? Object.values(repeatOn).some(Boolean)
                    : true) && (
                    <Text color="neutral.700" fontStyle="italic" mt={2}>
                      Next Donation scheduled for {getNextDonationDateDisplay()}
                    </Text>
                  )}
                </Box>
              )}

              <Flex
                justifyContent="flex-end"
                gap={3}
                mt={6}
                pt={4}
              >
                <Button
                  variant="outline"
                  color="gray.700"
                  fontWeight={600}
                  onClick={onClose}
                  size="md"
                >
                  Cancel
                </Button>
                <Button
                  backgroundColor="blue.ssf"
                  onClick={handleSubmit}
                  size="md"
                  fontWeight={600}
                >
                  Submit Donation
                </Button>
              </Flex>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default NewDonationFormModal;
