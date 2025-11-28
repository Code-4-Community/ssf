import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  Dialog,
  Portal,
  CloseButton,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { FoodRequest } from 'types/types';
import { formatDate } from '@utils/utils';

interface OrderDetailsModalProps {
  orderId: number;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  orderId,
  isOpen,
  onClose,
}) => {
  const [foodRequest, setFoodRequest] = useState<FoodRequest | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const foodRequestData = await ApiClient.getFoodRequestFromOrder(
            orderId,
          );
          setFoodRequest(foodRequestData);
        } catch (error) {
          console.error('Error fetching food request details:', error);
        }
      };

      fetchData();
    }
  }, [isOpen, orderId]);

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
                  Order #{orderId} Details
                </Dialog.Title>
                {foodRequest && (
                  <>
                    <Text fontSize="sm" color="neutral.800">
                      Request Id #{foodRequest.requestId}
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
                    <Text fontSize="sm" fontWeight="400" ml={2}>
                      {foodRequest.requestedSize}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="md" fontWeight="600" mb={1}>
                      Food Type(s)
                    </Text>
                    <Box>
                      {foodRequest.requestedItems.map((type, index) => (
                        <Box
                          display="inline-flex"
                          alignItems="center"
                          justifyContent="space-between"
                          backgroundColor="neutral.100"
                          borderRadius="md"
                          pl={2}
                          pr={3}
                          py={2}
                          mr={2}
                          mb={2}
                          key={index}
                          minW="fit-content"
                        >
                          <Text fontSize="sm" fontWeight="400" mr={10}>
                            {type}
                          </Text>
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
                    <Text fontSize="sm" fontWeight="400" ml={2}>
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
