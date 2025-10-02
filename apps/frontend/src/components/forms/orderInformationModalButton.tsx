import {
  Button,
  VStack,
  Dialog,
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
  const [isOpen, setIsOpen] = useState(false);
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
      <Button onClick={() => setIsOpen(true)}>{orderId}</Button>
      <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="lg">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Order Details</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
              {pantry ? (
                <VStack gap={4} align="start">
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
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
};

export default OrderInformationModalButton;