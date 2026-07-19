import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Text,
  VStack,
  Dialog,
  CloseButton,
  HStack,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import {
  Donation,
  DonationItem,
  FoodType,
  AlertStatus,
  ReplaceDonationItemDto,
  DonationStatus,
  RecurrenceEnum,
} from '../../types/types';
import { formatDate } from '@utils/utils';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../../hooks/alert';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';
import { EditButton, DeleteButton } from '@components/editDeleteButtons';
import EditableDonationItemsTable, {
  DonationRow,
} from './editableDonationItemsTable';

interface DonationDetailsModalProps {
  donation: Donation;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => void;
}

const DonationDetailsModal: React.FC<DonationDetailsModalProps> = ({
  donation,
  isOpen,
  onClose,
  onSuccess,
  onDelete,
}) => {
  useModalBodyCleanup();
  const [items, setItems] = useState<DonationItem[]>([]);

  const [alertState, setAlertMessage] = useAlert();

  const [isEditing, setIsEditing] = useState(false);

  const donationId = donation.donationId;

  const handleCancel = () => {
    setIsEditing(false);
  };

  const loadItems = useCallback(async () => {
    try {
      const itemsData = await ApiClient.getDonationItemsByDonationId(
        donationId,
      );
      setItems(itemsData);
    } catch {
      setAlertMessage('Error fetching donation details', AlertStatus.ERROR);
    }
  }, [donationId, setAlertMessage]);

  const handleUpdate = async (rows: DonationRow[]) => {
    const existingIds = new Set(items.map((i) => i.itemId));
    const body: ReplaceDonationItemDto[] = rows.map((r) => ({
      ...(existingIds.has(r.id) ? { itemId: r.id } : {}),
      itemName: r.foodItem,
      quantity: parseInt(r.numItems),
      ozPerItem: parseFloat(r.ozPerItem),
      estimatedValue: parseFloat(r.valuePerItem),
      foodType: r.foodType as FoodType,
      foodRescue: r.foodRescue,
    }));

    try {
      await ApiClient.editDonationItems(donationId, body);
      await loadItems();
      onSuccess();
      setAlertMessage('Successfully updated donation items.', AlertStatus.INFO);
      setIsEditing(false);
    } catch {
      setAlertMessage(
        'Donation items could not be updated.',
        AlertStatus.ERROR,
      );
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadItems();
  }, [isOpen, loadItems]);

  // Group items by food type
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.foodType]) acc[item.foodType] = [];
    acc[item.foodType].push(item);
    return acc;
  }, {} as Record<FoodType, DonationItem[]>);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) onClose();
      }}
      closeOnInteractOutside
      scrollBehavior="inside"
    >
      {alertState && (
        <FloatingAlert
          key={alertState.id}
          message={alertState.message}
          status={alertState.status}
          timeout={6000}
        />
      )}
      <Dialog.Backdrop bg="blackAlpha.300" />

      <Dialog.Positioner>
        <Dialog.Content
          maxW={isEditing ? '75vw' : 'lg'}
          maxH={isEditing ? '90vh' : undefined}
        >
          <Dialog.CloseTrigger asChild>
            <CloseButton />
          </Dialog.CloseTrigger>

          <Dialog.Header>
            <VStack align="stretch" gap={0}>
              <HStack mb={2}>
                <Dialog.Title fontSize="lg" fontWeight="600">
                  Donation #{donationId} Stock
                </Dialog.Title>
                {donation.status === DonationStatus.AVAILABLE && (
                  <>
                    <EditButton onClick={() => setIsEditing(true)}></EditButton>
                    <DeleteButton onClick={onDelete}></DeleteButton>
                  </>
                )}
              </HStack>
              <Text fontSize="sm">
                {donation.foodManufacturer?.foodManufacturerName}
              </Text>
              <Text fontSize="sm">{formatDate(donation.dateDonated)}</Text>
            </VStack>
          </Dialog.Header>

          <Dialog.Body>
            {isEditing ? (
              <EditableDonationItemsTable
                initialRows={items.map((item) => ({
                  id: item.itemId,
                  foodItem: item.itemName,
                  foodType: item.foodType,
                  numItems: String(item.quantity),
                  ozPerItem: String(item.ozPerItem),
                  valuePerItem: String(item.estimatedValue),
                  foodRescue: item.foodRescue,
                }))}
                onCancel={handleCancel}
                onSubmit={handleUpdate}
                submitButtonLabel="Update Donation"
              ></EditableDonationItemsTable>
            ) : (
              <VStack align="stretch" gap={4} my={2}>
                {Object.entries(groupedItems).map(([foodType, typeItems]) => (
                  <Box key={foodType}>
                    <Text
                      fontSize="sm"
                      fontWeight="600"
                      color="neutral.800"
                      mb={2}
                    >
                      {foodType}
                    </Text>

                    <VStack align="stretch" gap={2}>
                      {typeItems.map((item, _) => (
                        <Box
                          key={item.itemId}
                          display="flex"
                          p={0}
                          border="1px solid"
                          borderColor="neutral.100"
                          borderRadius="md"
                          overflow="hidden"
                          color="neutral.800"
                          fontSize="sm"
                        >
                          <Box flex={1} p={3} bg="white">
                            <Text>{item.itemName}</Text>
                          </Box>

                          <Box
                            borderLeft="1px solid"
                            borderColor="neutral.100"
                            p={3}
                            width="35%"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            bg="white"
                          >
                            <Text>
                              {item.quantity - item.reservedQuantity} of{' '}
                              {item.quantity} Remaining
                            </Text>
                          </Box>
                        </Box>
                      ))}
                    </VStack>
                  </Box>
                ))}
              </VStack>
            )}

            {!isEditing && donation.recurrence !== RecurrenceEnum.NONE && (
              <Box mt={6} color="neutral.800" fontSize="sm">
                <Text fontWeight={600} mb={3}>
                  Donation sets up recurring reminders
                </Text>

                {donation.nextDonationDates &&
                  donation.nextDonationDates.length > 0 && (
                    <Box>
                      <Text fontWeight={600} color="neutral.700" mb={2}>
                        Upcoming reminder emails
                      </Text>
                      <Text color="neutral.700">
                        {donation.nextDonationDates
                          .map((date) => formatDate(date))
                          .join(', ')}
                      </Text>
                    </Box>
                  )}
              </Box>
            )}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default DonationDetailsModal;
