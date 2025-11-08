import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { Pantry, User } from 'types/types';

interface PantryApplicationModalProps {
  pantry: Pantry;
  isOpen: boolean;
  onClose: () => void;
}

const PantryApplicationModal: React.FC<PantryApplicationModalProps> = ({
  pantry,
  isOpen,
  onClose,
}) => {
  const [user, setUser] = useState<User | null>(null);

  // TODO: Make sure clients of this modal actually include
  // the pantry representative ID (or the representative User
  // itself) in the provided data
  /*useEffect(() => {
    const fetchUser = async () => {
      if (pantry.pantryRepresentativeId) {
        const data = await ApiClient.getRepresentativeUser(
          pantry.pantryRepresentativeId,
        );
        setUser(data);
      }
    };

    if (isOpen) {
      fetchUser();
    }
  }, [isOpen, pantry.pantryRepresentativeId]);*/

  return (
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
              <strong>Address Line 1</strong>
            </GridItem>
            <GridItem>{pantry.addressLine1}</GridItem>

            <GridItem>
              <strong>Address Line 2</strong>
            </GridItem>
            <GridItem>{pantry.addressLine2 ?? ''}</GridItem>

            <GridItem>
              <strong>Address City</strong>
            </GridItem>
            <GridItem>{pantry.addressCity}</GridItem>

            <GridItem>
              <strong>Address State</strong>
            </GridItem>
            <GridItem>{pantry.addressState}</GridItem>

            <GridItem>
              <strong>Address Zip</strong>
            </GridItem>
            <GridItem>{pantry.addressZip}</GridItem>

            <GridItem>
              <strong>Address Country</strong>
            </GridItem>
            <GridItem>{pantry.addressCountry ?? ''}</GridItem>

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
            <GridItem>{pantry.reserveFoodForAllergic}</GridItem>

            <GridItem>
              <strong>Reservation Explanation</strong>
            </GridItem>
            <GridItem>{pantry.reservationExplanation ?? ''}</GridItem>

            <GridItem>
              <strong>Dedicated Allergen Friendly</strong>
            </GridItem>
            <GridItem>{pantry.dedicatedAllergyFriendly}</GridItem>

            <GridItem>
              <strong>Client Visit Frequency</strong>
            </GridItem>
            <GridItem>{pantry.clientVisitFrequency ?? ''}</GridItem>

            <GridItem>
              <strong>Identify Allergens Confidence</strong>
            </GridItem>
            <GridItem>{pantry.identifyAllergensConfidence ?? ''}</GridItem>

            <GridItem>
              <strong>Serve Allergic Children</strong>
            </GridItem>
            <GridItem>{pantry.serveAllergicChildren ?? ''}</GridItem>

            <GridItem>
              <strong>Newsletter Subscription</strong>
            </GridItem>
            <GridItem>{pantry.newsletterSubscription ? 'Yes' : 'No'}</GridItem>

            <GridItem>
              <strong>Restrictions</strong>
            </GridItem>
            <GridItem>{pantry.restrictions.join(', ')}</GridItem>

            <GridItem>
              <strong>Activities</strong>
            </GridItem>
            <GridItem>{pantry.activities.join(', ')}</GridItem>

            <GridItem>
              <strong>Activities Comments</strong>
            </GridItem>
            <GridItem>{pantry.activitiesComments ?? ''}</GridItem>

            <GridItem>
              <strong>Items in Stock</strong>
            </GridItem>
            <GridItem>{pantry.itemsInStock}</GridItem>

            <GridItem>
              <strong>Need More Options</strong>
            </GridItem>
            <GridItem>{pantry.needMoreOptions}</GridItem>
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PantryApplicationModal;
