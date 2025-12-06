import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  Dialog,
  Portal,
  CloseButton,
  Spacer,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { FoodRequest, Order } from 'types/types';
import { formatDate } from '@utils/utils';

interface OrderDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const [foodRequest, setFoodRequest] = useState<FoodRequest | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const foodRequestData = await ApiClient.getFoodRequestFromOrder(
            order.orderId,
          );
          setFoodRequest(foodRequestData);
        } catch (error) {
          console.error('Error fetching food request details:', error);
        }
      };

      fetchData();
    }
  }, [isOpen, order.orderId]);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) onClose();
      }}
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.200" />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>

            <Dialog.Header>
              <VStack align="stretch" gap={0}>
                <Dialog.Title
                  fontSize="lg"
                  mb={2}
                  fontWeight="600"
                  fontFamily="'Inter', sans-serif"
                >
                  Order {order.orderId}
                </Dialog.Title>
                {foodRequest && (
                  <>
                    <Text fontSize="sm" color="neutral.800">
                      {order.pantry.pantryName}
                    </Text>
                    <Text fontSize="sm" color="neutral.800">
                      Requested {formatDate(foodRequest.requestedAt)}
                    </Text>
                  </>
                )}
              </VStack>
            </Dialog.Header>

            <Dialog.Body>
              {foodRequest && (
                <VStack align="stretch" gap={6} my={2} color="neutral.800">
                  <Box>
                    <Text fontSize="md" fontWeight="600" mb={1}>
                      Size of Shipment
                    </Text>
                    <Text fontSize="sm" fontWeight="400">
                      {foodRequest.requestedSize}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="md" fontWeight="600" mb={3}>
                      Food Type(s)
                    </Text>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                      {foodRequest.requestedItems.map((type, index) => (
                        <Box
                          display="inline-flex"
                          alignItems="center"
                          bg="neutral.100"
                          border="2px solid"
                          borderColor="neutral.300"
                          borderRadius="4px"
                          p={2}
                          key={index}
                          gap={4}
                        >
                          <Text fontSize="sm" fontWeight="400">
                            {type}
                          </Text>

                          <Spacer />

                          <Text cursor="pointer" fontWeight="400">
                            x
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box>
                    <Text fontSize="md" fontWeight="600" mb={1}>
                      Additional Information
                    </Text>
                    <Text fontSize="sm" fontWeight="400">
                      {foodRequest.additionalInformation ||
                        'No details provided.'}
                    </Text>
                  </Box>
                </VStack>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default OrderDetailsModal;
