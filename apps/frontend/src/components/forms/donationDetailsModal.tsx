import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, HStack, Dialog, Portal } from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { Donation } from 'types/types';
import { DonationItem } from 'types/types';

interface DonationDetailsModalProps {
  donationId: number;
  isOpen: boolean;
  onClose: () => void;
}

const DonationDetailsModal: React.FC<DonationDetailsModalProps> = ({
  donationId,
  isOpen,
  onClose,
}) => {
  const [donation, setDonation] = useState<Donation | null>(null);
  const [items, setItems] = useState<DonationItem[]>([]);

  useEffect(() => { 
    if (isOpen) {
      const fetchData = async () => {
        try {
          const donationData = await ApiClient.getOrderDonation(donationId);
          const itemsData = await ApiClient.getDonationItemsByDonationId(donationId);
          
          setDonation(donationData);
          setItems(itemsData);
        } catch (error) {
          console.error('Error fetching donation details:', error);
        }
      };

      fetchData();
    }
  }, [isOpen, donationId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
        <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content>
                    <Dialog.CloseTrigger />

                    <Dialog.Header>
                        <Dialog.Title fontSize="lg" fontWeight="600" fontFamily="'Inter', sans-serif">
                        Donation #{donationId} Details
                        </Dialog.Title>
                    </Dialog.Header>
                
                    <Dialog.Body>
                        {donation && (
                        <VStack align="stretch" gap={3} fontFamily="'Inter', sans-serif" fontSize="sm">
                            <Text fontWeight="600">{donation.foodManufacturer?.foodManufacturerName}</Text>
                            <Text color="gray.600">{formatDate(donation.dateDonated)}</Text>

                            <Box mt={4}>
                            {items.map((item, index) => (
                                <Box key={index} mb={3}>
                                <Text fontWeight="600" mb={1}>{item.foodType}</Text>
                                <HStack justify="space-between">
                                    <Text color="gray.700">{item.itemName}</Text>
                                    <Text fontWeight="600">{item.quantity}</Text>
                                </HStack>
                                </Box>
                            ))}
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

export default DonationDetailsModal;
