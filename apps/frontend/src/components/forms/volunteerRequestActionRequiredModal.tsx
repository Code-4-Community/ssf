import React from 'react';
import { Button, VStack, CloseButton, Text, Dialog } from '@chakra-ui/react';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';

interface VolunteerRequestActionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseRequest: () => void;
  onCreateOrder: () => void;
}

const VolunteerRequestActionRequiredModal: React.FC<
  VolunteerRequestActionRequiredModalProps
> = ({ isOpen, onClose, onCloseRequest, onCreateOrder }) => {
  useModalBodyCleanup();
  const buttonStyles = {
    fontWeight: '600',
    fontSize: '14px',
    color: 'neutral.600',
  };

  const handleCloseRequest = async () => {
    onClose();
    onCloseRequest();
  };

  const handleCreateOrder = async () => {
    onClose();
    onCreateOrder();
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
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger asChild>
            <CloseButton size="lg" />
          </Dialog.CloseTrigger>

          <Dialog.Header pb={0}>
            <Dialog.Title fontSize="18px" fontFamily="inter" fontWeight={600}>
              Action Required
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body pb={6}>
            <VStack align="stretch" gap={4}>
              <Text textStyle="p2" color="gray.dark" mt={3}>
                This food request is still active. Continue to create associated
                orders for this request or close this request.
              </Text>
              <VStack align="stretch" gap={8} mt={6}>
                <Button
                  variant="outline"
                  borderColor="neutral.400"
                  borderWidth="1px"
                  bg="white"
                  {...buttonStyles}
                  onClick={handleCreateOrder}
                >
                  Create New Order
                </Button>
                <Button
                  bg="blue.core"
                  {...buttonStyles}
                  color="white"
                  onClick={handleCloseRequest}
                >
                  Close Request
                </Button>
              </VStack>
            </VStack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default VolunteerRequestActionRequiredModal;
