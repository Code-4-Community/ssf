import {
  Button,
  Text,
  Flex,
  Select,
  Table,
  Dialog,
  Input,
  Stack,
} from '@chakra-ui/react';
import { useState } from 'react';
import ApiClient from '@api/apiClient';
import { FoodTypes } from '../../types/types';

const NewDonationFormModalButton: React.FC<{
  onDonationSuccess: () => void;
}> = ({ onDonationSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
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
        totalItems += parseInt(row.numItems);
        totalOz += parseFloat(row.ozPerItem) * parseInt(row.numItems);
        totalValue += parseFloat(row.valuePerItem) * parseInt(row.numItems);
      }
    });

    totalOz = parseFloat(totalOz.toFixed(2));
    totalValue = parseFloat(totalValue.toFixed(2));

    setTotalItems(totalItems);
    setTotalOz(totalOz);
    setTotalValue(totalValue);
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
    if (rows.length === 1) {
      return;
    }
    const newRows = rows.slice(0, -1);
    setRows(newRows);
    calculateTotals(newRows);
  };

  const onClose = () => setIsOpen(false);

  const handleSubmit = async () => {
    const hasEmptyFields = rows.some(
      (row) =>
        row.foodItem === '' ||
        row.foodType === '' ||
        row.numItems === '' ||
        row.ozPerItem === '' ||
        row.valuePerItem === '',
    );

    if (hasEmptyFields) {
      alert('Please fill in all fields before submitting.');
      return;
    }

    onClose();

    const foodManufacturerId = 1;
    const donation_body = {
      foodManufacturerId: foodManufacturerId,
      totalItems: totalItems,
      totalOz: totalOz,
      totalEstimatedValue: totalValue,
    };

    try {
      const donationResponse = await ApiClient.postDonation(donation_body);
      const donationId = donationResponse?.donationId;

      onDonationSuccess();

      if (donationId) {
        rows.forEach(async (row) => {
          const donationItem_body = {
            donationId: donationId,
            itemName: row.foodItem,
            quantity: parseInt(row.numItems),
            ozPerItem: parseFloat(row.ozPerItem),
            estimatedValue: parseFloat(row.valuePerItem),
            foodType: row.foodType,
          };

          const donationItemResponse = await ApiClient.postDonationItem(
            donationItem_body,
          );
          if (donationItemResponse) {
            console.log('Donation item submitted successfully');
          } else {
            console.error('Failed to submit donation item');
            alert('Failed to submit donation item');
          }
        });
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
        console.error('Failed to submit donation');
        alert('Failed to submit donation');
      }
    } catch (error) {
      console.error('Error submitting new donation', error);
      alert('Error submitting new donation');
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Submit new donation</Button>
      <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="xl">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="49em">
            <Dialog.Header>
              <Dialog.Title fontSize={25} fontWeight={700}>
                SSF Log New Donation Form
              </Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
              <Text mb="1.5em">
                Log a new donation by filling out the form below. Use the add or
                delete row buttons to add or remove food items from the donation.
                Please make sure to fill out all fields before submitting.
              </Text>
              <Table.Root>
                <Table.Caption>
                  <Stack direction="row" align="center" gap={3} mt={3}>
                    <Text fontWeight="bold">
                      Total # of items: {totalItems} &nbsp;&nbsp; Total oz of
                      items: {totalOz} &nbsp;&nbsp; Total value of items:{' '}
                      {totalValue}
                    </Text>
                    <Button onClick={deleteRow}>- Delete Row</Button>
                    <Button onClick={addRow}>+ Add Row</Button>
                  </Stack>
                </Table.Caption>
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
                        <Select.Root
                          value={[row.foodType]}
                          onValueChange={(e) =>
                            handleChange(row.id, 'foodType', e.value[0])
                          }
                        >
                          <Select.Trigger>
                            <Select.ValueText placeholder="Select a food type" />
                          </Select.Trigger>
                          <Select.Content>
                            {FoodTypes.map((type) => (
                              <Select.Item key={type} item={type}>
                                {type}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      </Table.Cell>
                      <Table.Cell>
                        <Input
                          type="number"
                          value={row.numItems}
                          onChange={(e) =>
                            handleChange(row.id, 'numItems', e.target.value)
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Input
                          type="number"
                          value={row.ozPerItem}
                          onChange={(e) =>
                            handleChange(row.id, 'ozPerItem', e.target.value)
                          }
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Input
                          type="number"
                          value={row.valuePerItem}
                          onChange={(e) =>
                            handleChange(row.id, 'valuePerItem', e.target.value)
                          }
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
              <Flex justifyContent="space-between" mt={4}>
                <Button onClick={onClose}>Close</Button>
                <Button onClick={handleSubmit}>Submit</Button>
              </Flex>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
};

export default NewDonationFormModalButton;
