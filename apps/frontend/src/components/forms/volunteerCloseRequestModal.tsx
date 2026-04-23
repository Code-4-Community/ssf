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
import { FoodRequestSummaryDto } from 'types/types';
import { formatDate } from '@utils/utils';
import apiClient from '@api/apiClient';
import { useAlert } from '../../hooks/alert';
import { FloatingAlert } from '@components/floatingAlert';

interface CloseRequestActionModalProps {
  request: FoodRequestSummaryDto;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const VolunteerCloseRequestActionModal: React.FC<
  CloseRequestActionModalProps
> = ({ request, isOpen, onClose, onSuccess }) => {
  const [alertState, setAlertMessage] = useAlert();

  const onCloseRequest = async () => {
    try {
      await apiClient.closeFoodRequest(request.requestId);
      onClose();
      onSuccess();
    } catch {
      setAlertMessage('Error completing action. Please try again.');
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
            <Dialog.Title fontSize="18px" fontFamily="inter" fontWeight={600}>
              Confirm Action
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body pb={6}>
            <VStack align="stretch" gap={4}>
              <Text textStyle="p2" color="gray.dark">
                Are you sure you want to close this request? This action cannot
                be undone.
              </Text>
              <Box
                borderWidth={1}
                p={6}
                borderColor={'neutral.100'}
                borderRadius={5}
              >
                <Text textStyle="p2" color="gray.dark">
                  Request #{request.requestId}
                </Text>
                <Text color="neutral.600" textStyle="p2" fontSize={'12'}>
                  Submitted {formatDate(request.requestedAt)}
                </Text>
              </Box>
              <Flex justifyContent="flex-end" gap={2.5}>
                <Button
                  textStyle="p2"
                  fontWeight={600}
                  color="neutral.800"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  textStyle="p2"
                  fontWeight={600}
                  bg={'blue.hover'}
                  color={'white'}
                  onClick={onCloseRequest}
                >
                  Close Request
                </Button>
              </Flex>
            </VStack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default VolunteerCloseRequestActionModal;
