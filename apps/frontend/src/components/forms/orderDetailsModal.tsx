import React, { useState, useEffect } from 'react';
import { Text, Dialog, CloseButton, Textarea, Field } from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { FoodRequest, OrderSummary } from 'types/types';
import { formatDate } from '@utils/utils';
import { FloatingAlert } from '@components/floatingAlert';
import { TagGroup } from './tagGroup';

interface OrderDetailsModalProps {
  order: OrderSummary;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const [foodRequest, setFoodRequest] = useState<FoodRequest | null>(null);

  const [alertMessage, setAlertMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const foodRequestData = await ApiClient.getFoodRequestFromOrder(
            order.orderId,
          );
          setFoodRequest(foodRequestData);
        } catch (error) {
          setAlertMessage('Error fetching food request details:' + error);
        }
      };

      fetchData();
    }
  }, [isOpen, order.orderId]);

  return (
    <Dialog.Root
      open={isOpen}
      size="xl"
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) onClose();
      }}
      closeOnInteractOutside
    >
      {alertMessage && (
        <FloatingAlert message={alertMessage} status="error" timeout={6000} />
      )}
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW={650}>
          <Dialog.Header pb={0} mt={2}>
            <Dialog.Title fontSize="lg" fontWeight={700} fontFamily="inter">
              Order {order.orderId}
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {foodRequest && (
              <>
                <Text textStyle="p2" color="#111111">
                  {order.request.pantry.pantryName}
                </Text>
                <Text mb={8} color="#52525B" textStyle="p2" pt={0} mt={0}>
                  Requested {formatDate(foodRequest.requestedAt)}
                </Text>

                <Field.Root mb={4}>
                  <Field.Label>
                    <Text textStyle="p2" fontWeight={600} color="neutral.800">
                      Size of Shipment
                    </Text>
                  </Field.Label>
                  <Text
                    fontSize="sm"
                    fontWeight="400"
                    color="neutral.800"
                    mt={1}
                    w="full"
                  >
                    {foodRequest.requestedSize}
                  </Text>
                </Field.Root>

                <Field.Root mb={4}>
                  <Field.Label>
                    <Text textStyle="p2" fontWeight={600} color="neutral.800">
                      Food Type(s)
                    </Text>
                  </Field.Label>
                  <TagGroup values={foodRequest.requestedItems} />
                </Field.Root>

                <Field.Root mb={4}>
                  <Field.Label>
                    <Text textStyle="p2" fontWeight={600} color="neutral.800">
                      Additional Information
                    </Text>
                  </Field.Label>
                  <Textarea
                    value={
                      foodRequest.additionalInformation ||
                      'No additional information supplied.'
                    }
                    readOnly
                    pl={-2}
                    size="lg"
                    textStyle="p2"
                    color="neutral.800"
                    bg="white"
                    border="none"
                    resize="none"
                    disabled
                  />
                </Field.Root>
              </>
            )}
          </Dialog.Body>

          <Dialog.CloseTrigger asChild>
            <CloseButton size="lg" />
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default OrderDetailsModal;
