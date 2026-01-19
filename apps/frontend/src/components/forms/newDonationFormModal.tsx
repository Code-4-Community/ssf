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
} from '@chakra-ui/react';
import { useState } from 'react';
import ApiClient from '@api/apiClient';
import { FoodTypes } from '../../types/types';

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
  const [rows, setRows] = useState([
    {
      id: 1,
      foodItem: '',
      foodType: '',
      numItems: '',
      ozPerItem: '',
      valuePerItem: '',
    },
  ]);

  const [totalItems, setTotalItems] = useState(0);
  const [totalOz, setTotalOz] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  const handleChange = (id: number, field: string, value: string) => {
    const updatedRows = rows.map((row) =>
      row.id === id ? { ...row, [field]: value } : row,
    );

    setRows(updatedRows);
    calculateTotals(updatedRows);
  };

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
      },
    ]);
  };

  const deleteRow = () => {
    const newRows = rows.slice(0, -1);
    setRows(newRows);
    calculateTotals(newRows);
  };

  const handleSubmit = async () => {
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

    const donation_body = {
      foodManufacturerId: 1,
      totalItems,
      totalOz,
      totalEstimatedValue: totalValue,
    };

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
          foodType: row.foodType,
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
          },
        ]);
        setTotalItems(0);
        setTotalOz(0);
        setTotalValue(0);
      } else {
        alert('Failed to submit donation');
      }
    } catch (error) {
      alert('Error submitting new donation: ' + error);
    }
    onClose();
  };

  return (
    <Dialog.Root
      open={isOpen}
      size="xl"
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) onClose();
      }}
      closeOnInteractOutside
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="49em">
            <Dialog.CloseTrigger />

            <Dialog.Header asChild>
              <Dialog.Title fontSize={25} fontWeight={700}>
                SSF Log New Donation Form
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Text mb="1.5em">
                Log a new donation by filling out the form below.
              </Text>

              <Box display="block" overflowX="auto" whiteSpace="nowrap">
                <Table.Root variant="line">
                  <TableCaption>
                    <Stack direction="row" align="center" gap={3} mt={3}>
                      <Text fontWeight="bold">
                        Total Items: {totalItems} &nbsp; Total oz: {totalOz}{' '}
                        &nbsp; Total Value: {totalValue}
                      </Text>
                      <Button onClick={deleteRow}>- Delete Row</Button>
                      <Button onClick={addRow}>+ Add Row</Button>
                    </Stack>
                  </TableCaption>

                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Food Item</Table.ColumnHeader>
                      <Table.ColumnHeader>Food Type</Table.ColumnHeader>
                      <Table.ColumnHeader># of Items</Table.ColumnHeader>
                      <Table.ColumnHeader>Oz per Item</Table.ColumnHeader>
                      <Table.ColumnHeader>Value per Item</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {rows.map((row) => (
                      <Table.Row key={row.id}>
                        <Table.Cell>
                          <Input
                            value={row.foodItem}
                            onChange={(e) =>
                              handleChange(row.id, 'foodItem', e.target.value)
                            }
                          />
                        </Table.Cell>

                        <Table.Cell>
                          <NativeSelect.Root>
                            <NativeSelect.Field
                              value={row.foodType}
                              onChange={(e) =>
                                handleChange(row.id, 'foodType', e.target.value)
                              }
                            >
                              <option value="">Select food type...</option>
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
                            type="number"
                            min={0}
                            value={row.numItems}
                            onChange={(e) =>
                              handleChange(row.id, 'numItems', e.target.value)
                            }
                          />
                        </Table.Cell>

                        <Table.Cell>
                          <Input
                            type="number"
                            min={0}
                            value={row.ozPerItem}
                            onChange={(e) =>
                              handleChange(row.id, 'ozPerItem', e.target.value)
                            }
                          />
                        </Table.Cell>

                        <Table.Cell>
                          <Input
                            type="number"
                            min={0}
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
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>

              <Flex justifyContent="space-between" mt={4}>
                <Button onClick={onClose}>Close</Button>
                <Button onClick={handleSubmit}>Submit</Button>
              </Flex>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default NewDonationFormModal;
