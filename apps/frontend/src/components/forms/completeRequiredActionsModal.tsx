import React, { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  CloseButton,
  Text,
  Flex,
  Dialog,
} from '@chakra-ui/react';
import { CircleCheck } from 'lucide-react';
import ApiClient from '@api/apiClient';
import {
  VolunteerOrder,
  VolunteerAction,
  VolunteerActionCompletion,
} from '../../types/types';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../../hooks/alert';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';

interface CompleteRequiredActionsModalProps {
  order: VolunteerOrder;
  isOpen: boolean;
  onClose: () => void;
  onActionCompleted: (orderId: number, action: VolunteerAction) => void;
}

const CompleteRequiredActionsModal: React.FC<
  CompleteRequiredActionsModalProps
> = ({ order, isOpen, onClose, onActionCompleted }) => {
  useModalBodyCleanup();
  const [alertState, setAlertMessage] = useAlert();
  const [loadingAction, setLoadingAction] = useState<VolunteerAction | null>(
    null,
  );

  const completion: VolunteerActionCompletion = order.actionCompletion ?? {
    confirmDonationReceipt: false,
    notifyPantry: false,
  };

  const handleComplete = async (action: VolunteerAction) => {
    setLoadingAction(action);
    try {
      await ApiClient.completeOrderAction(order.orderId, action);
      onActionCompleted(order.orderId, action);
    } catch {
      setAlertMessage('Error completing action. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const sectionTitleStyles = {
    fontWeight: '600',
    fontSize: '14px',
    color: 'neutral.800',
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
          status="error"
          timeout={6000}
        />
      )}
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger asChild>
            <CloseButton size="lg" />
          </Dialog.CloseTrigger>

          <Dialog.Header pb={0}>
            <Dialog.Title fontSize="lg" fontWeight={600}>
              Complete Required Action
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body pb={6}>
            <VStack align="stretch" gap={4}>
              <Text fontSize="sm" color="gray.dark" mt={1}>
                Please complete the following outstanding actions for this
                order.
              </Text>
              <Box>
                <Box
                  border="1px solid"
                  borderColor="neutral.100"
                  borderRadius="md"
                  p={4}
                >
                  <Flex align="center" gap={2}>
                    {completion.confirmDonationReceipt && (
                      <CircleCheck size={18} />
                    )}
                    <Text {...sectionTitleStyles}>
                      Confirm Donation Receipt
                    </Text>
                  </Flex>
                  <Text textStyle="p2" color="gray.dark" mt={6}>
                    Please contact the food pantry to confirm their donation
                    receipt order.
                  </Text>
                </Box>
                {!completion.confirmDonationReceipt && (
                  <Flex justify="flex-end" mt={4}>
                    <Button
                      size="sm"
                      bg="neutral.900"
                      color="white"
                      fontSize="12px"
                      px={2}
                      h="20px"
                      _hover={{ bg: 'neutral.700' }}
                      loading={
                        loadingAction ===
                        VolunteerAction.CONFIRM_DONATION_RECEIPT
                      }
                      onClick={() =>
                        handleComplete(VolunteerAction.CONFIRM_DONATION_RECEIPT)
                      }
                    >
                      Mark as Complete
                    </Button>
                  </Flex>
                )}
              </Box>

              <Box>
                <Box
                  border="1px solid"
                  borderColor="neutral.100"
                  borderRadius="md"
                  p={4}
                >
                  <Flex align="center" gap={2}>
                    {completion.notifyPantry && <CircleCheck size={18} />}
                    <Text {...sectionTitleStyles}>Notify Pantry</Text>
                  </Flex>
                  <Text textStyle="p2" color="gray.dark" mt={6}>
                    Subheading Content
                  </Text>
                </Box>
                {!completion.notifyPantry && (
                  <Flex justify="flex-end" mt={4}>
                    <Button
                      size="sm"
                      bg="neutral.900"
                      color="white"
                      fontSize="12px"
                      px={2}
                      h="20px"
                      _hover={{ bg: 'neutral.700' }}
                      loading={loadingAction === VolunteerAction.NOTIFY_PANTRY}
                      onClick={() =>
                        handleComplete(VolunteerAction.NOTIFY_PANTRY)
                      }
                    >
                      Mark as Complete
                    </Button>
                  </Flex>
                )}
              </Box>
            </VStack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default CompleteRequiredActionsModal;
