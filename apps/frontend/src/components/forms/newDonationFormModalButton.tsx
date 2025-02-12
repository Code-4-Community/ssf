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
} from '@chakra-ui/react';
import { useState } from 'react';
import ApiClient from '@api/apiClient';

const NewDonationFormModalButton: React.FC = () => {
  const getFoodTypes = () => {
    return [
      'Dairy-Free Alternatives',
      'Dried Beans (Gluten-Free, Nut-Free)',
      'Gluten-Free Baking/Pancake Mixes',
      'Gluten-Free Bread',
      'Gluten-Free Tortillas',
      'Granola',
      'Masa Harina Flour',
      'Nut-Free Granola Bars',
      'Olive Oil',
      'Refrigerated Meals',
      'Rice Noodles',
      'Seed Butters (Peanut Butter Alternative)',
      'Whole-Grain Cookies',
      'Quinoa',
    ];
  };

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

    let totalItems = 0,
      totalOz = 0,
      totalValue = 0;

    updatedRows.forEach((row) => {
      if (row.numItems && row.ozPerItem && row.valuePerItem) {
        totalItems += parseInt(row.numItems);
        totalOz += parseInt(row.ozPerItem);
        totalValue += parseInt(row.valuePerItem);
      }
    });

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
    setRows(rows.slice(0, -1));
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

      if (donationId) {
        rows.forEach(async (row) => {
          const donationItem_body = {
            donationId: donationId,
            itemName: row.foodItem,
            quantity: parseInt(row.numItems),
            ozPerItem: parseInt(row.ozPerItem),
            estimatedValue: parseInt(row.valuePerItem),
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
      <Button onClick={onOpen}>Submit new request</Button>
      <Modal isOpen={isOpen} size={'xl'} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxW="49em">
          <ModalHeader fontSize={25} fontWeight={700}>
            SSF Food Request Form
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb="1.5em">
              Request a shipment of allergen-free food from SSF. You will be
              placed on our waiting list for incoming donations targeted to your
              needs.
              <br />
              <br />
              Please keep in mind that we may not be able to accommodate
              specific food requests at all times, but we will do our best to
              match your preferences.
            </Text>
            <TableContainer>
              <Table variant="simple">
                <TableCaption>
                  <strong>Total # of items: </strong>
                  {totalItems} &nbsp;&nbsp;&nbsp;
                  <strong> Total oz of items: </strong>
                  {totalOz} &nbsp;&nbsp;&nbsp;
                  <strong> Total value of items: </strong>
                  {totalValue}
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
                          {getFoodTypes().map((type) => (
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
              <Button mt={4} onClick={addRow}>
                + Add Row
              </Button>
              <Button mt={4} onClick={deleteRow}>
                - Delete Row
              </Button>
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
