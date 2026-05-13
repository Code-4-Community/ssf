import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Text,
  VStack,
  Badge,
} from '@chakra-ui/react';
import { ChevronDown } from 'lucide-react';
import {
  CreateDonationDto,
  DonationDetails,
  DonationItem,
  RecurrenceEnum,
} from '../../types/types';
import ApiClient from '@api/apiClient';
import { FloatingAlert } from '@components/floatingAlert';
import { useAlert } from '../../hooks/alert';
import { useGroupedItemsByFoodType } from '../../hooks/groupedItemsByFoodType';
import { useModalBodyCleanup } from '../../hooks/modalBodyCleanup';

interface ResubmitDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  donations: DonationDetails[];
  foodManufacturerId: number;
  initialDonationId?: number | null;
  onSelect: (donationId: number) => void;
}

const formatDonationDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const ResubmitDonationModal: React.FC<ResubmitDonationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  donations,
  foodManufacturerId,
  initialDonationId,
  onSelect,
}) => {
  useModalBodyCleanup();
  const [errorAlertState, setErrorMessage] = useAlert();
  const [selectedDonationId, setSelectedDonationId] = useState<number | null>(
    null,
  );
  const [items, setItems] = useState<DonationItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const groupedItems = useGroupedItemsByFoodType(items);

  const sortedDonations = [...donations].sort(
    (a, b) =>
      new Date(b.donation.dateDonated).getTime() -
      new Date(a.donation.dateDonated).getTime(),
  );

  const selectedDonation = donations.find(
    (d) => d.donation.donationId === selectedDonationId,
  );

  const fetchItemsForDonation = useCallback(
    async (donationId: number) => {
      try {
        const fetchedItems = await ApiClient.getDonationItemsByDonationId(
          donationId,
        );
        setItems(fetchedItems);
      } catch {
        setErrorMessage('Error loading donation details');
      }
    },
    [setErrorMessage],
  );

  useEffect(() => {
    if (
      isOpen &&
      initialDonationId != null &&
      initialDonationId !== selectedDonationId
    ) {
      handleSelect(initialDonationId);
    }
  }, [isOpen, initialDonationId, selectedDonationId, fetchItemsForDonation]);

  const handleSelect = (donationId: number) => {
    setSelectedDonationId(donationId);
    fetchItemsForDonation(donationId);
    onSelect(donationId);
  };

  const handleClose = () => {
    setSelectedDonationId(null);
    setItems([]);
    setIsDropdownOpen(false);
    onClose();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const dto: CreateDonationDto = {
        foodManufacturerId,
        recurrence: RecurrenceEnum.NONE,
        items: items.map((item) => ({
          itemName: item.itemName,
          quantity: item.quantity,
          ozPerItem:
            item.ozPerItem != null ? Number(item.ozPerItem) : undefined,
          estimatedValue:
            item.estimatedValue != null
              ? Number(item.estimatedValue)
              : undefined,
          foodType: item.foodType,
          foodRescue: item.foodRescue,
        })),
      };
      await ApiClient.postDonation(dto);
      onSuccess();
      handleClose();
    } catch {
      setErrorMessage('Error submitting donation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      size="md"
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) handleClose();
      }}
      closeOnInteractOutside
    >
      {errorAlertState && (
        <FloatingAlert
          key={errorAlertState.id}
          message={errorAlertState.message}
          status="error"
          timeout={6000}
        />
      )}
      <Dialog.Backdrop />
      <Portal>
        <Dialog.Positioner>
          <Dialog.Content minH="360px" display="flex" flexDirection="column">
            <Dialog.CloseTrigger asChild>
              <CloseButton size="lg" />
            </Dialog.CloseTrigger>

            <Dialog.Header pb={0}>
              <Dialog.Title
                fontSize="18px"
                fontFamily="inter"
                fontWeight={600}
                color="gray.dark"
              >
                Previous Donations
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body pb={6} flex={1} display="flex" flexDirection="column">
              <VStack align="stretch" gap={4} mt={3} flex={1}>
                <Box>
                  <Text
                    textStyle="p2"
                    fontWeight={600}
                    color="neutral.800"
                    mb={1.5}
                  >
                    Select a Previous Donation
                  </Text>
                  <Box position="relative">
                    <Flex
                      as="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      border="1px solid"
                      borderColor="neutral.100"
                      borderRadius="md"
                      h="40px"
                      px={3}
                      align="center"
                      w="full"
                      cursor="pointer"
                    >
                      {selectedDonation ? (
                        <Flex align="center" justify="space-between" flex={1}>
                          <Text
                            textStyle="p2"
                            color="gray.dark"
                            fontWeight={500}
                          >
                            {formatDonationDate(
                              selectedDonation.donation.dateDonated,
                            )}
                          </Text>
                          {selectedDonation.donation.recurrence !==
                            RecurrenceEnum.NONE && (
                            <Badge
                              bg="teal.200"
                              color="teal.hover"
                              fontSize="12px"
                              fontWeight={500}
                              px={2}
                              borderRadius="md"
                            >
                              Recurring
                            </Badge>
                          )}
                        </Flex>
                      ) : (
                        <Text textStyle="p2" color="neutral.300" flex={1}>
                          Select a previous donation
                        </Text>
                      )}
                      <ChevronDown size={20} />
                    </Flex>

                    {isDropdownOpen && (
                      <>
                        <Box
                          position="fixed"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          onClick={() => setIsDropdownOpen(false)}
                          zIndex={10}
                        />
                        <Box
                          position="absolute"
                          top="100%"
                          left={0}
                          right={0}
                          border="1px solid"
                          borderColor="neutral.100"
                          borderRadius="md"
                          zIndex={20}
                          mt={1}
                          py={1}
                          maxH="120px"
                          overflowY="auto"
                          bg="white"
                        >
                          {sortedDonations.map((d) => (
                            <Flex
                              key={d.donation.donationId}
                              px={2}
                              py={1}
                              cursor="pointer"
                              _hover={{ bg: 'neutral.50' }}
                              align="center"
                              bg="white"
                              onClick={() => {
                                handleSelect(d.donation.donationId);
                                setIsDropdownOpen(false);
                              }}
                            >
                              <Text
                                textStyle="p2"
                                fontWeight={500}
                                color="gray.dark"
                                flex={1}
                              >
                                {formatDonationDate(d.donation.dateDonated)}
                              </Text>
                              {d.donation.recurrence !==
                                RecurrenceEnum.NONE && (
                                <Badge
                                  bg="teal.200"
                                  color="teal.hover"
                                  fontSize="12px"
                                  fontWeight={500}
                                  px={2}
                                  borderRadius="md"
                                >
                                  Recurring
                                </Badge>
                              )}
                            </Flex>
                          ))}
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>

                {selectedDonationId !== null && (
                  <Box>
                    <Text
                      textStyle="p2"
                      fontWeight={600}
                      color="neutral.800"
                      mb={2}
                    >
                      Donation Details
                    </Text>
                    <Box
                      border="1px solid"
                      borderColor="neutral.100"
                      borderRadius="md"
                      p={3}
                      maxH="250px"
                      overflowY="auto"
                    >
                      <VStack align="stretch" gap={4}>
                        {Object.entries(groupedItems).map(
                          ([foodType, typeItems]) => (
                            <Box key={foodType}>
                              <Text
                                textStyle="p2"
                                fontWeight={600}
                                color="neutral.800"
                              >
                                {foodType}
                              </Text>
                              {typeItems.map((item) => (
                                <Flex
                                  key={item.itemId}
                                  border="1px solid"
                                  borderColor="neutral.100"
                                  borderRadius="md"
                                  px={4}
                                  align="center"
                                  mt={2}
                                >
                                  <Text
                                    py={2}
                                    textStyle="p2"
                                    color="neutral.800"
                                    flex={1}
                                  >
                                    {item.itemName}
                                  </Text>
                                  <Box
                                    alignSelf="stretch"
                                    borderLeft="1px solid"
                                    borderColor="neutral.100"
                                    mx={3}
                                  />
                                  <Text
                                    minW={5}
                                    py={2}
                                    textStyle="p2"
                                    color="neutral.800"
                                  >
                                    {item.quantity}
                                  </Text>
                                </Flex>
                              ))}
                            </Box>
                          ),
                        )}
                      </VStack>
                    </Box>
                  </Box>
                )}

                <Flex justify="flex-end" mt="auto">
                  <Button
                    bg={
                      selectedDonationId !== null ? 'blue.core' : 'neutral.600'
                    }
                    color="white"
                    fontFamily="inter"
                    fontWeight={600}
                    fontSize="14px"
                    px={7}
                    h="32px"
                    borderRadius="md"
                    disabled={selectedDonationId === null || isSubmitting}
                    onClick={handleSubmit}
                  >
                    Submit Donation
                  </Button>
                </Flex>
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ResubmitDonationModal;
