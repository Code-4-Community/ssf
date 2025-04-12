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
import { Pantry, FoodManufacturer, Allocation } from 'types/types';

interface OrderInformationModalButtonProps {
  orderId: number;
}

const OrderInformationModalButton: React.FC<
  OrderInformationModalButtonProps
> = ({ orderId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pantry, setPantry] = useState<Pantry | null>(null);
  const [allocationItems, setAllocationItems] = useState<Allocation[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const pantryData = await ApiClient.getPantryFromOrder(orderId);
          const allocationItemData = await ApiClient.getAllAllocationsByOrder(
            orderId,
          );

          setPantry(pantryData);
          setAllocationItems(allocationItemData);
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
            {pantry ? (
              <VStack spacing={4} align="start">
                <Text>
                  <strong>Pantry Name:</strong> {pantry.pantryName}
                </Text>
                <Text>
                  <strong>Pantry Address:</strong> {pantry.address}
                </Text>
                <Text>
                  <strong>Order Items:</strong>
                  {allocationItems.length > 0 ? (
                    allocationItems.map((allocation) => (
                      <Text key={allocation.allocationId}>
                        - {allocation.allocatedQuantity}{' '}
                        {allocation.item.itemName}
                      </Text>
                    ))
                  ) : (
                    <Text>No order contents available</Text>
                  )}
                </Text>
              </VStack>
            ) : (
              <Text>No data to load</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default OrderInformationModalButton;
