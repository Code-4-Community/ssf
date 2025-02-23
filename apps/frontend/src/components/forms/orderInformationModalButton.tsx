import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  TableContainer,
  Tr,
  Th,
  Td,
  Thead,
  Tbody,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import ApiClient from '@api/apiClient';
import { Pantry, FoodRequest, FoodManufacturer } from 'types/types';

interface OrderInformationModalButtonProps {
  orderId: number;
}

const OrderInformationModalButton: React.FC<
  OrderInformationModalButtonProps
> = ({ orderId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pantry, setPantry] = useState<Pantry | null>(null);
  const [foodRequest, setFoodRequest] = useState<FoodRequest | null>(null);
  const [manufacturer, setManufacturer] = useState<FoodManufacturer | null>(
    null,
  );

  useEffect(() => {
    if (isOpen) {
      ApiClient.getPantryFromOrder(orderId).then((data) => setPantry(data));
      ApiClient.getFoodRequestFromOrder(orderId).then((data) =>
        setFoodRequest(data),
      );
      ApiClient.getManufacturerFromOrder(orderId).then((data) =>
        setManufacturer(data),
      );
    }
  }, [isOpen, orderId]);

  return (
    <>
      <Button onClick={onOpen}>{orderId}</Button>

      <Modal isOpen={isOpen} size="md" onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Order Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {pantry && foodRequest && manufacturer ? (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Pantry ID</Th>
                      <Th>Pantry Address</Th>
                      <Th>Request ID</Th>
                      <Th>Request Info</Th>
                      <Th>Manufacturer</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>{pantry.pantryId}</Td>
                      <Td>{pantry.address}</Td>
                      <Td>{foodRequest.requestId}</Td>
                      <Td>{foodRequest.additionalInformation}</Td>
                      <Td>{manufacturer.foodManufacturerName}</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <p>Loading order details...</p>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default OrderInformationModalButton;
