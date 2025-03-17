import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Flex,
  Select,
  Table,
  TableContainer,
  Tr,
  Th,
  Td,
  Thead,
  Input,
  Tbody,
  TableCaption,
  Stack,
} from '@chakra-ui/react';
import { useState } from 'react';
import ApiClient from '@api/apiClient';
import { FoodTypes } from '../../types/types';

const NewDonationFormModalButton: React.FC<{
  onDonationSuccess: () => void;
}> = ({ onDonationSuccess }) => {
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

      // Automatically update the page after creating new donation
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

  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Button onClick={onOpen}>Submit new donation</Button>
      <Button onClick={onOpen}>Log new Donation</Button>
      <Modal isOpen={isOpen} size={'xl'} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW="49em">
          <ModalHeader fontSize={25} fontWeight={700}>
            SSF Log New Donation Form SSF Donation Log Form
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb="1.5em">
              Log a new donation by filling out the form below. Use the add or
              delete row buttons to add or remove food items from the donation.
              Please make sure to fill out all fields before submitting.
            </Text>
            <Text mb="1.5em">Log a new donation</Text>
            <TableContainer>
              <Table variant="simple">
                <TableCaption>
                  <Stack direction="row" align="center" spacing={3} mt={3}>
                    <Text fontWeight="bold">
                      Total # of items: {totalItems} &nbsp;&nbsp; Total oz of
                      items: {totalOz} &nbsp;&nbsp; Total value of items:{' '}
                      {totalValue}
                    </Text>
                    <Button onClick={deleteRow}>- Delete Row</Button>
                    <Button onClick={addRow}>+ Add Row</Button>
                  </Stack>
                </TableCaption>
                <Thead>
                  <Tr>
                    <Th>Food Item</Th>
                    <Th>Food Type</Th>
                    <Th># of Items</Th>
                    <Th>Oz per Item</Th>
                    <Th>Value per Item</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {rows.map((row) => (
                    <Tr key={row.id}>
                      <Td>
                        <Input
                          value={row.foodItem}
                          onChange={(e) =>
                            handleChange(row.id, 'foodItem', e.target.value)
                          }
                        />
                      </Td>
                      <Td>
                        <Select
                          placeholder="Select a food type"
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
                        </Select>
                      </Td>
                      <Td>
                        <Input
                          type="number"
                          value={row.numItems}
                          onChange={(e) =>
                            handleChange(row.id, 'numItems', e.target.value)
                          }
                        />
                      </Td>
                      <Td>
                        <Input
                          type="number"
                          value={row.ozPerItem}
                          onChange={(e) =>
                            handleChange(row.id, 'ozPerItem', e.target.value)
                          }
                        />
                      </Td>
                      <Td>
                        <Input
                          type="number"
                          value={row.valuePerItem}
                          onChange={(e) =>
                            handleChange(row.id, 'valuePerItem', e.target.value)
                          }
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            <Flex justifyContent="space-between" mt={4}>
              <Button onClick={onClose}>Close</Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NewDonationFormModalButton;
