import React, { useState, useEffect } from 'react';
import { Box, Text, VStack, Dialog, Portal, CloseButton } from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { Donation } from 'types/types';
import { DonationItem } from 'types/types';
import { formatDate } from '@utils/utils';

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
          alert('Error fetching donation details:' + error);
        }
      };

      fetchData();
    }
  }, [isOpen, donationId]);

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.foodType]) {
      acc[item.foodType] = [];
    }
    acc[item.foodType].push(item);
    return acc;
  }, {} as Record<string, DonationItem[]>)

  return (
    <Dialog.Root 
      open={isOpen} 
      onOpenChange={(e) => {
        if (!e.open) onClose()
      }}
      closeOnInteractOutside
    >
        <Portal>
            <Dialog.Backdrop bg="blackAlpha.200"/>
            <Dialog.Positioner>
                <Dialog.Content>
                    <Dialog.CloseTrigger asChild>
                      <CloseButton />
                    </Dialog.CloseTrigger>

                    <Dialog.Header>
                      <VStack align="stretch" gap={0}>
                        <Dialog.Title fontSize="lg" mb={2} fontWeight="600" fontFamily="'Inter', sans-serif">
                          Donation #{donationId} Details
                        </Dialog.Title>
                        {donation && (
                          <>
                            <Text fontSize="sm" color="neutral.800">
                              {donation.foodManufacturer?.foodManufacturerName}
                            </Text>
                            <Text fontSize="sm" color="neutral.800">
                              {formatDate(donation.dateDonated)}
                            </Text>
                          </>
                        )}
                      </VStack>
                    </Dialog.Header>
                
                    <Dialog.Body>
                      {donation && (
                        <VStack align="stretch" gap={4} my={2}>
                          {Object.entries(groupedItems).map(([foodType, typeItems]) => (
                            <Box key={foodType}>
                              <Text fontSize="md" fontWeight="600" mb={2} color="neutral.800">
                                {foodType}
                              </Text>
                              <VStack align="stretch" gap={2}>
                                {typeItems.map((item, index) => (
                                  <Box
                                    key={index}
                                    display="flex"
                                    p={0}
                                    border="1px solid"
                                    borderColor="neutral.100"
                                    borderRadius="md"
                                    overflow="hidden"
                                  >
                                    <Box flex={1} p={3} bg="white">
                                      <Text color="neutral.800" fontSize="sm">
                                        {item.itemName}
                                      </Text>
                                    </Box>
                                    <Box 
                                      borderLeft="1px solid" 
                                      borderColor="neutral.100" 
                                      p={3}
                                      minW="50px"
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                      bg="white"
                                    >
                                      <Text color="neutral.800" fontSize="sm">{item.quantity}</Text>
                                    </Box>
                                  </Box>
                                ))}
                              </VStack>
                            </Box>
                          ))}
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
