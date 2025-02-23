import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  Text,
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
  const [foodManufacturer, setFoodManufacturer] =
    useState<FoodManufacturer | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const pantryData = await ApiClient.getPantryFromOrder(orderId);
          const foodRequestData = await ApiClient.getFoodRequestFromOrder(
            orderId,
          );
          const foodManufacturerData = await ApiClient.getManufacturerFromOrder(
            orderId,
          );

          setPantry(pantryData);
          setFoodRequest(foodRequestData);
          setFoodManufacturer(foodManufacturerData);
        } catch (error) {
          console.error('Error fetching order details:', error);
        }
      };

      fetchData();
    }
  }, [isOpen, orderId]);

  return (
    <>
      <Button onClick={onOpen}>{orderId}</Button>
      <Modal isOpen={isOpen} size="lg" onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Order Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {pantry && foodRequest && foodManufacturer ? (
              <VStack spacing={4} align="start">
                <Text>
                  <strong>Pantry ID:</strong> {pantry.pantryId}
                </Text>
                <Text>
                  <strong>Pantry Address:</strong> {pantry.address}
                </Text>
                <Text>
                  <strong>Requested Items:</strong>
                  {foodRequest.requestedItems.map((item, index) => (
                    <div key={index}>{item}</div>
                  ))}
                </Text>
              </VStack>
            ) : (
              <p>No data to load</p>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default OrderInformationModalButton;
