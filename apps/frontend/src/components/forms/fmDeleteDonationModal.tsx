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
import { AlertStatus, Donation } from '../../types/types';
import { formatDate } from '@utils/utils';
import apiClient from '@api/apiClient';
import { useAlert } from '../../hooks/alert';
import { FloatingAlert } from '@components/floatingAlert';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';

interface FMDeleteDonationActionModalProps {
  donation: Donation;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FMDeleteDonationActionModal: React.FC<
  FMDeleteDonationActionModalProps
> = ({ donation, isOpen, onClose, onSuccess }) => {
  useModalBodyCleanup();
  const [alertState, setAlertMessage] = useAlert();

  const onDeleteDonation = async () => {
    try {
      await apiClient.deleteDonation(donation.donationId);
      onClose();
      onSuccess();
    } catch {
      setAlertMessage('Donation could not be deleted.', AlertStatus.ERROR);
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
                Are you sure you want to delete this donation? This action
                cannot be undone.
              </Text>
              <Box
                borderWidth={1}
                p={6}
                borderColor={'gray.200'}
                borderRadius={6}
              >
                <Text textStyle="p2" color="gray.dark">
                  Donation #{donation.donationId}
                </Text>
                <Text color="neutral.600" textStyle="p2" fontSize={'12'}>
                  Submitted {formatDate(donation.dateDonated)}
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
                  onClick={onDeleteDonation}
                >
                  Delete
                </Button>
              </Flex>
            </VStack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default FMDeleteDonationActionModal;
