import React, { useEffect, useState } from 'react';
import {
  Button,
  Grid,
  Dialog,
  GridItem,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { Pantry, User } from 'types/types';

interface PantryApplicationModalButtonProps {
  pantry: Pantry;
}

const PantryApplicationModalButton: React.FC<
  PantryApplicationModalButtonProps
> = ({ pantry }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
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
  }, [isOpen, pantry.pantryRepresentativeId]);

  return (
    <>
      <Button variant="plain" colorPalette="blue" onClick={() => setIsOpen(true)}>
        {pantry.pantryName}
      </Button>

      <Dialog.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="xl">
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Pantry Application Details</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
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
                <GridItem>{pantry.dedicatedAllergyFriendly}</GridItem>

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

                <GridItem>
                  <strong>Activities</strong>
                </GridItem>
                <GridItem>{pantry.activities}</GridItem>

                <GridItem>
                  <strong>Questions</strong>
                </GridItem>
                <GridItem>{pantry.questions}</GridItem>

                <GridItem>
                  <strong>Items in Stock</strong>
                </GridItem>
                <GridItem>{pantry.itemsInStock}</GridItem>

                <GridItem>
                  <strong>Need More Options</strong>
                </GridItem>
                <GridItem>{pantry.needMoreOptions}</GridItem>
              </Grid>
            </Dialog.Body>
            <Dialog.Footer>
              <Button colorPalette="blue" onClick={() => setIsOpen(false)}>
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
};

export default PantryApplicationModalButton;
