import React from 'react';
import {
  Box,
  Button,
  VStack,
  CloseButton,
  Text,
  Flex,
  Dialog,
} from '@chakra-ui/react';
import { AlertStatus, OrderDetails } from '../../types/types';
import apiClient from '@api/apiClient';
import { useAlert } from '../../hooks/alert';
import { FloatingAlert } from '@components/floatingAlert';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';

interface VolunteerCloseOrderModalProps {
  order: OrderDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VolunteerCloseOrderModal: React.FC<VolunteerCloseOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  useModalBodyCleanup();
  const [alertState, setAlertMessage] = useAlert();

  const onCloseOrder = async () => {
    if (order === null) return;
    try {
      await apiClient.closeOrder(order.orderId);
      onClose();
      onSuccess();
    } catch {
      setAlertMessage('Order could not be closed.', AlertStatus.ERROR);
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      size="md"
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) onClose();
      }}
      closeOnInteractOutside
    >
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status={alertState.status}
          timeout={6000}
        />
      )}
      <Dialog.Backdrop />
      {order !== null && (
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="lg" />
            </Dialog.CloseTrigger>

            <Dialog.Header pb={0}>
              <Dialog.Title fontSize="18px" fontFamily="inter" fontWeight={600}>
                Confirm Action
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body pb={6}>
              <VStack align="stretch" gap={4}>
                <Text textStyle="p2" color="gray.dark">
                  Are you sure you want to delete this order? This action cannot
                  be undone. The respective food manufacturer will be notified
                  of this change.
                </Text>
                <Box
                  borderWidth={1}
                  p={6}
                  borderColor={'gray.200'}
                  borderRadius={6}
                >
                  <Text textStyle="p2" color="gray.dark">
                    Order #{order.orderId}
                  </Text>
                  <Text textStyle="p2" color="gray.dark">
                    Fulfilled by {order.foodManufacturerName}
                  </Text>
                </Box>
                <Flex justifyContent="flex-end" gap={2.5}>
                  <Button
                    textStyle="p2"
                    fontWeight={600}
                    color="neutral.800"
                    variant="outline"
                    h="36px"
                    px={3}
                    flexShrink={0}
                    textAlign="center"
                    lineHeight="28px"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    textStyle="p2"
                    fontWeight={600}
                    bg={'red.hover'}
                    color={'white'}
                    width="92px"
                    h="36px"
                    px={5}
                    flexShrink={0}
                    textAlign="center"
                    onClick={onCloseOrder}
                  >
                    Close
                  </Button>
                </Flex>
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      )}
    </Dialog.Root>
  );
};

export default VolunteerCloseOrderModal;
