import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Text,
  VStack,
  Dialog,
  CloseButton,
  HStack,
  Table,
  Button,
  Input,
  NativeSelect,
  NativeSelectIndicator,
  Checkbox,
  Flex,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import {
  Donation,
  DonationItem,
  FoodType,
  AlertStatus,
  ReplaceDonationItemDto,
  DonationStatus,
} from '../../types/types';
import { formatDate } from '@utils/utils';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../../hooks/alert';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';
import { EditButton, DeleteButton } from '@components/editDeleteButtons';
import { Minus } from 'lucide-react';

interface DonationDetailsModalProps {
  donation: Donation;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => void;
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

const mapItemsToRows = (items: DonationItem[]): DonationRow[] =>
  items.map((item) => ({
    id: item.itemId,
    foodItem: item.itemName,
    foodType: item.foodType,
    numItems: String(item.quantity),
    ozPerItem: String(item.ozPerItem),
    valuePerItem: String(item.estimatedValue),
    foodRescue: item.foodRescue,
  }));

const DonationDetailsModal: React.FC<DonationDetailsModalProps> = ({
  donation,
  isOpen,
  onClose,
  onSuccess,
  onDelete,
}) => {
  useModalBodyCleanup();
  const [items, setItems] = useState<DonationItem[]>([]);

  const [rows, setRows] = useState<DonationRow[]>([]);

  const [alertState, setAlertMessage] = useAlert();

  const [isEditing, setIsEditing] = useState(false);

  const donationId = donation.donationId;

  const placeholderStyles = {
    color: 'neutral.300',
    fontFamily: 'inter',
    fontSize: 'sm',
    fontWeight: '400',
  };

  const deleteRow = (id: number) => {
    const newRows = rows.filter((r) => r.id !== id);
    setRows(newRows);
  };

  const handleChange = (id: number, field: string, value: string | boolean) => {
    const newRows = rows.map((row) =>
      row.id === id ? { ...row, [field]: value } : row,
    );
    setRows(newRows);
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

  const handleCancel = () => {
    setRows(mapItemsToRows(items));
    setIsEditing(false);
  };

  const loadItems = useCallback(async () => {
    try {
      const itemsData = await ApiClient.getDonationItemsByDonationId(
        donationId,
      );
      setItems(itemsData);
      setRows(mapItemsToRows(itemsData));
    } catch {
      setAlertMessage('Error fetching donation details', AlertStatus.ERROR);
    }
  }, [donationId, setAlertMessage]);

  const handleUpdate = () => {
    const existingIds = new Set(items.map((i) => i.itemId));
    const body: ReplaceDonationItemDto[] = rows.map((r) => ({
      ...(existingIds.has(r.id) ? { itemId: r.id } : {}),
      itemName: r.foodItem,
      quantity: parseInt(r.numItems),
      ozPerItem: parseFloat(r.ozPerItem),
      estimatedValue: parseFloat(r.valuePerItem),
      foodType: r.foodType as FoodType,
      foodRescue: r.foodRescue,
    }));

    const updateData = async () => {
      try {
        await ApiClient.editDonationItems(donationId, body);
        await loadItems();
        onSuccess();
        setAlertMessage(
          'Successfully updated donation items.',
          AlertStatus.INFO,
        );
        setIsEditing(false);
      } catch {
        setAlertMessage(
          'Donation items could not be updated.',
          AlertStatus.ERROR,
        );
      }
    };

    updateData();
  };

  useEffect(() => {
    if (!isOpen) return;
    loadItems();
  }, [isOpen, loadItems]);

  // Group items by food type
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.foodType]) acc[item.foodType] = [];
    acc[item.foodType].push(item);
    return acc;
  }, {} as Record<FoodType, DonationItem[]>);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) onClose();
      }}
      closeOnInteractOutside
      scrollBehavior="inside"
    >
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status={alertState.status}
          timeout={6000}
        />
      )}
      <Dialog.Backdrop bg="blackAlpha.300" />

      <Dialog.Positioner>
        <Dialog.Content
          maxW={isEditing ? '75vw' : 'lg'}
          maxH={isEditing ? '90vh' : undefined}
        >
          <Dialog.CloseTrigger asChild>
            <CloseButton />
          </Dialog.CloseTrigger>

          <Dialog.Header>
            <VStack align="stretch" gap={0}>
              <HStack mb={2}>
                <Dialog.Title fontSize="lg" fontWeight="600">
                  Donation #{donationId} Stock
                </Dialog.Title>
                {donation.status === DonationStatus.AVAILABLE && (
                  <>
                    <EditButton onClick={() => setIsEditing(true)}></EditButton>
                    <DeleteButton onClick={onDelete}></DeleteButton>
                  </>
                )}
              </HStack>
              <Text fontSize="sm">
                {donation.foodManufacturer?.foodManufacturerName}
              </Text>
              <Text fontSize="sm">{formatDate(donation.dateDonated)}</Text>
            </VStack>
          </Dialog.Header>

          <Dialog.Body>
            {isEditing ? (
              <>
                <Box display="block" overflowX="auto" whiteSpace="nowrap">
                  <Table.Root
                    variant="line"
                    size="md"
                    style={{ borderCollapse: 'collapse' }}
                  >
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
                          <Text as="span" color="red">
                            *
                          </Text>
                        </Table.ColumnHeader>
                        <Table.ColumnHeader width="14%">
                          Donation Value
                          <Text as="span" color="red">
                            *
                          </Text>
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
                          <Text as="span" color="red">
                            *
                          </Text>
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
                              _hover={{ bg: 'neutral.50' }}
                              _disabled={{
                                opacity: 0.4,
                                cursor: 'not-allowed',
                              }}
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
                                  handleChange(
                                    row.id,
                                    'foodType',
                                    e.target.value,
                                  )
                                }
                              >
                                {Object.values(FoodType).map((type) => (
                                  <option
                                    key={type}
                                    value={type}
                                    style={{
                                      color: 'var(--chakra-colors-neutral-800)',
                                    }}
                                  >
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
                              step={1}
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
                              min={0.01}
                              step={0.01}
                              value={row.ozPerItem}
                              onChange={(e) =>
                                handleChange(
                                  row.id,
                                  'ozPerItem',
                                  e.target.value,
                                )
                              }
                            />
                          </Table.Cell>

                          <Table.Cell>
                            <Input
                              _placeholder={placeholderStyles}
                              color="neutral.800"
                              placeholder="Enter $"
                              type="number"
                              min={0.01}
                              step={0.01}
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

                <Button
                  display="inline-flex"
                  alignItems="center"
                  bg="white"
                  color="neutral.800"
                  fontWeight={600}
                  fontSize={14}
                  borderRadius={4}
                  borderColor="neutral.200"
                  variant="outline"
                  mt={4}
                  onClick={addRow}
                >
                  Add New Row +
                </Button>

                <Flex
                  justifyContent="flex-end"
                  gap={3}
                  mt={6}
                  pt={4}
                  align="center"
                >
                  <Button
                    variant="outline"
                    color="gray.700"
                    fontWeight={600}
                    size="md"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    backgroundColor="blue.ssf"
                    size="md"
                    fontWeight={600}
                    onClick={handleUpdate}
                    disabled={rows.some(
                      (r) =>
                        r.foodItem === '' ||
                        r.foodType === '' ||
                        r.numItems === '' ||
                        r.ozPerItem === '' ||
                        r.valuePerItem === '',
                    )}
                  >
                    Update Donation
                  </Button>
                </Flex>
              </>
            ) : (
              <VStack align="stretch" gap={4} my={2}>
                {Object.entries(groupedItems).map(([foodType, typeItems]) => (
                  <Box key={foodType}>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      color="neutral.800"
                      mb={2}
                    >
                      {foodType}
                    </Text>

                    <VStack align="stretch" gap={2}>
                      {typeItems.map((item, _) => (
                        <Box
                          key={item.itemId}
                          display="flex"
                          p={0}
                          border="1px solid"
                          borderColor="neutral.100"
                          borderRadius="md"
                          overflow="hidden"
                          color="neutral.800"
                          fontSize="sm"
                        >
                          <Box flex={1} p={3} bg="white">
                            <Text>{item.itemName}</Text>
                          </Box>

                          <Box
                            borderLeft="1px solid"
                            borderColor="neutral.100"
                            p={3}
                            width="35%"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            bg="white"
                          >
                            <Text>
                              {item.quantity - item.reservedQuantity} of{' '}
                              {item.quantity} Remaining
                            </Text>
                          </Box>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            )}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default DonationDetailsModal;
