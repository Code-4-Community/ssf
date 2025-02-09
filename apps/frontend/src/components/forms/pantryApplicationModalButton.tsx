import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Grid,
  GridItem,
} from '@chakra-ui/react';

interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

interface Pantry {
  pantryId: number;
  pantryName: string;
  address: string;
  allergenClients: string | null;
  refrigeratedDonation: string | null;
  reserveFoodForAllergic: boolean;
  reservationExplanation: string;
  dedicatedAllergenFriendly: string;
  clientVisitFrequency: string;
  identifyAllergensConfidence: string;
  serveAllergicChildren: string;
  newsletterSubscription: boolean;
  restrictions: string[];
  ssfRepresentativeId: number;
  pantryRepresentativeId: number;
  status: string;
}

interface PantryApplicationModalButtonProps {
  pantry: Pantry;
}

const PantryApplicationModalButton: React.FC<
  PantryApplicationModalButtonProps
> = ({ pantry }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState<User | null>(null);

  const getRepresentativeUser = async (): Promise<User | null> => {
    try {
      const response = await fetch(
        `/api/users/${pantry.pantryRepresentativeId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        return await response.json();
      } else {
        alert(
          'Failed to fetch pantry representative user ' +
            (await response.text()),
        );
        return null;
      }
    } catch (error) {
      alert('Error fetching pantry representative user ' + error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const data = await getRepresentativeUser();
      setUser(data);
    };
    fetchUser();
  }, []);

  return (
    <>
      <Button variant="link" colorScheme="blue" onClick={onOpen}>
        {pantry.pantryName}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pantry Application Details</ModalHeader>
          <ModalBody>
            {user ? (
              <Grid templateColumns="2fr 1fr" gap={4}>
                <GridItem>
                  <strong>Representative Name</strong>
                </GridItem>
                <GridItem>
                  {user.firstName} {user.lastName}
                </GridItem>

                <GridItem>
                  <strong>Email</strong>
                </GridItem>
                <GridItem>{user.email}</GridItem>

                <GridItem>
                  <strong>Phone</strong>
                </GridItem>
                <GridItem>{user.phone}</GridItem>

                <GridItem>
                  <strong>Role</strong>
                </GridItem>
                <GridItem>{user.role}</GridItem>
              </Grid>
            ) : (
              <p>No user details available.</p>
            )}

            <Grid templateColumns="2fr 1fr" gap={5} mt={4}>
              <GridItem>
                <strong>Pantry Id</strong>
              </GridItem>
              <GridItem>{pantry.pantryId}</GridItem>

              <GridItem>
                <strong>Pantry Name</strong>
              </GridItem>
              <GridItem>{pantry.pantryName}</GridItem>

              <GridItem>
                <strong>Address</strong>
              </GridItem>
              <GridItem>{pantry.address}</GridItem>

              <GridItem>
                <strong>Allergen Clients</strong>
              </GridItem>
              <GridItem>{pantry.allergenClients}</GridItem>

              <GridItem>
                <strong>Refrigerated Donation</strong>
              </GridItem>
              <GridItem>{pantry.refrigeratedDonation}</GridItem>

              <GridItem>
                <strong>Reserve Food for Allergic</strong>
              </GridItem>
              <GridItem>
                {pantry.reserveFoodForAllergic ? 'Yes' : 'No'}
              </GridItem>

              <GridItem>
                <strong>Reservation Explanation</strong>
              </GridItem>
              <GridItem>{pantry.reservationExplanation}</GridItem>

              <GridItem>
                <strong>Dedicated Allergen Friendly</strong>
              </GridItem>
              <GridItem>{pantry.dedicatedAllergenFriendly}</GridItem>

              <GridItem>
                <strong>Client Visit Frequency</strong>
              </GridItem>
              <GridItem>{pantry.clientVisitFrequency}</GridItem>

              <GridItem>
                <strong>Identify Allergens Confidence</strong>
              </GridItem>
              <GridItem>{pantry.identifyAllergensConfidence}</GridItem>

              <GridItem>
                <strong>Serve Allergic Children</strong>
              </GridItem>
              <GridItem>{pantry.serveAllergicChildren}</GridItem>

              <GridItem>
                <strong>Newsletter Subscription</strong>
              </GridItem>
              <GridItem>
                {pantry.newsletterSubscription ? 'Yes' : 'No'}
              </GridItem>

              <GridItem>
                <strong>Restrictions</strong>
              </GridItem>
              <GridItem>{pantry.restrictions.join(', ')}</GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PantryApplicationModalButton;
