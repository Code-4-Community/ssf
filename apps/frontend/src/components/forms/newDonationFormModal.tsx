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
import { useState } from 'react';
import ApiClient from '@api/apiClient';
import {
  DayOfWeek,
  FoodType,
  FoodTypes,
  RecurrenceEnum,
  RepeatOnState,
} from '../../types/types';
import { Minus } from 'lucide-react';
import { generateNextDonationDate } from '@utils/utils';
import { FloatingAlert } from '@components/floatingAlert';

interface NewDonationFormModalProps {
  onDonationSuccess: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface DonationRow {
  id: number;
  foodItem: string;
  foodType: FoodType | '';
  numItems: string;
  ozPerItem: string;
  valuePerItem: string;
  foodRescue: boolean;
}

// Display labels for RecurrenceEnum values in the UI
const RECURRENCE_LABELS: Record<RecurrenceEnum, string> = {
  [RecurrenceEnum.NONE]: 'None',
  [RecurrenceEnum.WEEKLY]: 'Week',
  [RecurrenceEnum.MONTHLY]: 'Month',
  [RecurrenceEnum.YEARLY]: 'Year',
};

const NewDonationFormModal: React.FC<NewDonationFormModalProps> = ({
  onDonationSuccess,
  isOpen,
  onClose,
}) => {
  const [rows, setRows] = useState<DonationRow[]>([
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
  const [repeatEvery, setRepeatEvery] = useState('1');
  const [repeatInterval, setRepeatInterval] = useState<RecurrenceEnum>(
    RecurrenceEnum.NONE,
  );
  const [repeatOn, setRepeatOn] = useState<RepeatOnState>({
    Monday: false,
    Tuesday: false,
    Wednesday: true,
    Thursday: false,
    Friday: false,
    Saturday: false,
    Sunday: false,
  });
  const [endsAfter, setEndsAfter] = useState('1');
  const [alertMessage, setAlertMessage] = useState<string>('');

  const handleChange = (id: number, field: string, value: string | boolean) => {
    const updatedRows = rows.map((row) =>
      row.id === id ? { ...row, [field]: value } : row,
    );
    setRows(updatedRows);
  };

  const handleDayToggle = (day: DayOfWeek) => {
    setRepeatOn((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
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

  const deleteRow = (id: number) => {
    if (rows.length > 1) {
      const newRows = rows.filter((r) => r.id !== id);
      setRows(newRows);
    }
  };

  const getNextDonationDateDisplay = (): string => {
    const date = generateNextDonationDate(
      repeatEvery,
      repeatInterval,
      repeatOn,
    );
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSelectedDaysText = () => {
    const selected = (Object.keys(repeatOn) as DayOfWeek[]).filter(
      (day) => repeatOn[day],
    );
    if (selected.length === 0) return 'Select days';
    if (selected.length === 1) return selected[0];
    if (selected.length <= 4) return selected.join(', ');
    return `${selected.slice(0, 4).join(', ')} + ${selected.length - 4}`;
  };

  const handleSubmit = async () => {
    const hasEmpty = rows.some(
      (row) => !row.foodItem || !row.foodType || !row.numItems,
    );
    if (hasEmpty) {
      setAlertMessage('Please fill in all fields before submitting.');
      return;
    }

    if (
      isRecurring &&
      repeatInterval === RecurrenceEnum.WEEKLY &&
      !Object.values(repeatOn).some(Boolean)
    ) {
      setAlertMessage('Please select at least one day for weekly recurrence.');
      return;
    }

    const donation_body = {
      foodManufacturerId: 1,
      recurrenceFreq: isRecurring ? parseInt(repeatEvery) : null,
      recurrence: isRecurring ? repeatInterval : RecurrenceEnum.NONE,
      repeatOnDays:
        isRecurring && repeatInterval === RecurrenceEnum.WEEKLY
          ? repeatOn
          : null,
      occurrencesRemaining: isRecurring ? parseInt(endsAfter) : null,
    };

    try {
      const donationResponse = await ApiClient.postDonation(donation_body);
      console.log('Submitted donation');
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
        setIsRecurring(false);
        setRepeatInterval(RecurrenceEnum.NONE);
        onClose();
      } else {
        setAlertMessage('Failed to submit donation');
      }
    } catch (error) {
      setAlertMessage('Error submitting new donation: ' + error);
    }
  };

  const isRepeatOnDisabled = repeatInterval !== RecurrenceEnum.WEEKLY;

  const placeholderStyles = {
    color: 'neutral.300',
    fontFamily: 'inter',
    fontSize: 'sm',
    fontWeight: '400',
  };

  return (
    <Dialog.Root
      open={isOpen}
      size="md"
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) onClose();
      }}
      closeOnInteractOutside
    >
      {alertMessage && (
        <FloatingAlert
          key={alertMessage + Date.now()}
          message={alertMessage}
          status="error"
          timeout={6000}
        />
      )}
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
              <Text mb={4} mt={-4} color="neutral.700">
                Please fill out the following information to record donation
                details.
              </Text>

              <Box display="block" overflowX="auto" whiteSpace="nowrap">
                <Table.Root
                  variant="line"
                  size="md"
                  style={{ borderCollapse: 'collapse' }}
                >
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
                        onCheckedChange={(e: { checked: boolean }) => {
                          setIsRecurring(!!e.checked);
                          setRepeatInterval(
                            e.checked
                              ? RecurrenceEnum.WEEKLY
                              : RecurrenceEnum.NONE,
                          );
                        }}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Label color="neutral.700" fontWeight={400}>
                          Make Donation Recurring
                        </Checkbox.Label>
                      </Checkbox.Root>
                    </Stack>
                  </TableCaption>

                  <Table.Header>
                    <Table.Row fontWeight={600}>
                      <Table.ColumnHeader width="32px" p={1} />
                      <Table.ColumnHeader width="23%" p={0}>
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
                      <Table.ColumnHeader
                        width="20px"
                        textAlign="left"
                        px={0}
                        pl={4}
                        whiteSpace="normal"
                        lineHeight="tight"
                      >
                        Food Rescue
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {rows.map((row) => (
                      <Table.Row key={row.id}>
                        <Table.Cell width="32px" p={0} pr={2}>
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
                            width="28px"
                            height="28px"
                            minW="28px"
                            padding={0}
                          >
                            <Box color="neutral.300">
                              <Minus
                                style={{ width: '24px', height: '24px' }}
                              />
                            </Box>
                          </Button>
                        </Table.Cell>

                        <Table.Cell p={0} pr={4}>
                          <Input
                            _placeholder={placeholderStyles}
                            color="neutral.800"
                            placeholder="Enter Food"
                            value={row.foodItem}
                            onChange={(e) =>
                              handleChange(row.id, 'foodItem', e.target.value)
                            }
                          />
                        </Table.Cell>

                        <Table.Cell>
                          <NativeSelect.Root size="md" width="100%">
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
                            _placeholder={placeholderStyles}
                            color="neutral.800"
                            placeholder="Enter #"
                            type="number"
                            min={1}
                            value={row.numItems}
                            onChange={(e) =>
                              handleChange(row.id, 'numItems', e.target.value)
                            }
                          />
                        </Table.Cell>

                        <Table.Cell>
                          <Input
                            _placeholder={placeholderStyles}
                            color="neutral.800"
                            placeholder="Enter #"
                            type="number"
                            min={1}
                            value={row.ozPerItem}
                            onChange={(e) =>
                              handleChange(row.id, 'ozPerItem', e.target.value)
                            }
                          />
                        </Table.Cell>

                        <Table.Cell>
                          <Input
                            _placeholder={placeholderStyles}
                            color="neutral.800"
                            placeholder="Enter $"
                            type="number"
                            min={1}
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

                        <Table.Cell px={0} pl={6} width="32px">
                          <Checkbox.Root
                            checked={row.foodRescue}
                            size="lg"
                            borderRadius="2px"
                            onCheckedChange={(e: { checked: boolean }) =>
                              handleChange(row.id, 'foodRescue', !!e.checked)
                            }
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control
                              borderRadius="2px"
                              borderColor="#E4E4E7"
                            >
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
                          onValueChange={(e: { value: string }) =>
                            setRepeatEvery(e.value)
                          }
                          min={1}
                        >
                          <NumberInput.Input />
                          <NumberInput.Control />
                        </NumberInput.Root>
                        <NativeSelect.Root flex="1" size="md">
                          <NativeSelect.Field
                            value={repeatInterval}
                            onChange={(e) =>
                              setRepeatInterval(
                                e.target.value as RecurrenceEnum,
                              )
                            }
                          >
                            {(Object.values(RecurrenceEnum) as RecurrenceEnum[])
                              .filter((v) => v !== RecurrenceEnum.NONE)
                              .map((v) => (
                                <option key={v} value={v}>
                                  {RECURRENCE_LABELS[v]}
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
                      <Menu.Root
                        closeOnSelect={false}
                        positioning={{ sameWidth: true }}
                      >
                        {!isRepeatOnDisabled ? (
                          <Menu.Trigger asChild>
                            <Box cursor="pointer" width="100%">
                              <NativeSelect.Root size="md" width="100%">
                                <NativeSelect.Field
                                  value={getSelectedDaysText()}
                                  bg="white"
                                  readOnly
                                >
                                  <option>{getSelectedDaysText()}</option>
                                </NativeSelect.Field>
                                <NativeSelectIndicator />
                              </NativeSelect.Root>
                            </Box>
                          </Menu.Trigger>
                        ) : (
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
                                <option>{getSelectedDaysText()}</option>
                              </NativeSelect.Field>
                              <NativeSelectIndicator />
                            </NativeSelect.Root>
                          </Box>
                        )}
                        {!isRepeatOnDisabled && (
                          <Portal>
                            <Menu.Positioner>
                              <Menu.Content
                                maxH="300px"
                                color="neutral.800"
                                zIndex={9999}
                              >
                                {(Object.keys(repeatOn) as DayOfWeek[]).map(
                                  (day) => (
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
                                  ),
                                )}
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
                        onValueChange={(e: { value: string }) =>
                          setEndsAfter(e.value)
                        }
                        min={1}
                      >
                        <Flex position="relative" align="center">
                          <NumberInput.Input pl={4} pr="140px" fontSize="sm" />
                          <Text
                            position="absolute"
                            left={`calc(16px + ${
                              endsAfter.length * 0.6
                            }em + 8px)`}
                            color="neutral.800"
                            fontSize="sm"
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

                  {(repeatInterval !== RecurrenceEnum.WEEKLY ||
                    Object.values(repeatOn).some(Boolean)) && (
                    <Text color="neutral.700" fontStyle="italic" mt={2}>
                      Next Donation scheduled for {getNextDonationDateDisplay()}
                    </Text>
                  )}
                </Box>
              )}

              <Flex justifyContent="flex-end" gap={3} mt={6} pt={4}>
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
