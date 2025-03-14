import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  VStack,
  Text,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import ApiClient from '@api/apiClient';
import {
  Pantry,
  FoodRequest,
  FoodManufacturer,
  Donation,
  DonationItem,
} from 'types/types';

interface OrderInformationModalButtonProps {
  orderId: number;
}

const OrderInformationModalButton: React.FC<
  OrderInformationModalButtonProps
> = ({ orderId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pantry, setPantry] = useState<Pantry | null>(null);
  const [foodManufacturer, setFoodManufacturer] =
    useState<FoodManufacturer | null>(null);
  const [donation, setDonation] = useState<Donation | null>(null);
  const [donationItems, setDonationItems] = useState<DonationItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const pantryData = await ApiClient.getPantryFromOrder(orderId);
          const foodManufacturerData = await ApiClient.getManufacturerFromOrder(
            orderId,
          );
          const donationData = await ApiClient.getDonationFromOrder(orderId);

          setPantry(pantryData);
          setFoodManufacturer(foodManufacturerData);
          setDonation(donationData);

          if (donationData?.donationId) {
            const donationItemsData =
              await ApiClient.getDonationItemsByDonationId(
                donationData.donationId,
              );
            setDonationItems(donationItemsData);
          }
        } catch (error) {
          console.error('Error fetching order details:', error);
        }
      };

      fetchData();
    }
  }, [isOpen, orderId]);

  return (
    <>
      <Button onClick={onOpen}>{orderId}</Button>
      <Modal isOpen={isOpen} size="lg" onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Order Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {pantry && donation && foodManufacturer ? (
              <VStack spacing={4} align="start">
                <Text>
                  <strong>Pantry ID:</strong> {pantry.pantryId}
                </Text>
                <Text>
                  <strong>Pantry Address:</strong> {pantry.address}
                </Text>
                <Text>
                  <strong>Donation Items:</strong>
                  {donationItems.length > 0 ? (
                    donationItems.map((item) => (
                      <Text key={item.itemId}>
                        {item.itemName} - {item.quantity} - {item.foodType}
                      </Text>
                    ))
                  ) : (
                    <Text>No donation items available</Text>
                  )}
                </Text>
              </VStack>
            ) : (
              <Text>No data to load</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default OrderInformationModalButton;
