import React, { useEffect, useState } from 'react';
import { Button, Dialog, Grid, GridItem, Text } from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { User } from 'types/types';
import { Pantry } from 'types/pantryTypes';

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
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e: { open: boolean }) => {
        if (!e.open) onClose();
      }}
      size="xl"
      closeOnInteractOutside
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>Pantry Application Details</Dialog.Header>
          <Dialog.Body>
            {user ? (
              <Grid templateColumns="2fr 1fr" gap={4}>
                <GridItem>
                  <Text fontWeight="bold">Representative Name</Text>
                </GridItem>

                <GridItem>
                  {user.firstName} {user.lastName}
                </GridItem>

                <GridItem>
                  <Text fontWeight="bold">Email</Text>
                </GridItem>
                <GridItem>{user.email}</GridItem>

                <GridItem>
                  <Text fontWeight="bold">Phone</Text>
                </GridItem>
                <GridItem>{user.phone}</GridItem>

                <GridItem>
                  <Text fontWeight="bold">Role</Text>
                </GridItem>
                <GridItem>{user.role}</GridItem>
              </Grid>
            ) : (
              <Text>No user details available.</Text>
            )}

            <Grid templateColumns="2fr 1fr" gap={5} mt={4}>
              <GridItem>
                <Text fontWeight="bold">Pantry Id</Text>
              </GridItem>
              <GridItem>{pantry.pantryId}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Pantry Name</Text>
              </GridItem>
              <GridItem>{pantry.pantryName}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Address Line 1</Text>
              </GridItem>
              <GridItem>{pantry.addressLine1}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Address Line 2</Text>
              </GridItem>
              <GridItem>{pantry.addressLine2 ?? ''}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Address City</Text>
              </GridItem>
              <GridItem>{pantry.addressCity}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Address State</Text>
              </GridItem>
              <GridItem>{pantry.addressState}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Address Zip</Text>
              </GridItem>
              <GridItem>{pantry.addressZip}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Address Country</Text>
              </GridItem>
              <GridItem>{pantry.addressCountry ?? ''}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Allergen Clients</Text>
              </GridItem>
              <GridItem>{pantry.allergenClients}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Refrigerated Donation</Text>
              </GridItem>
              <GridItem>{pantry.refrigeratedDonation}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Reserve Food for Allergic</Text>
              </GridItem>
              <GridItem>{pantry.reserveFoodForAllergic}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Reservation Explanation</Text>
              </GridItem>
              <GridItem>{pantry.reservationExplanation ?? ''}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Dedicated Allergen Friendly</Text>
              </GridItem>
              <GridItem>{pantry.dedicatedAllergyFriendly}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Client Visit Frequency</Text>
              </GridItem>
              <GridItem>{pantry.clientVisitFrequency ?? ''}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Identify Allergens Confidence</Text>
              </GridItem>
              <GridItem>{pantry.identifyAllergensConfidence ?? ''}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Serve Allergic Children</Text>
              </GridItem>
              <GridItem>{pantry.serveAllergicChildren ?? ''}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Newsletter Subscription</Text>
              </GridItem>
              <GridItem>
                {pantry.newsletterSubscription ? 'Yes' : 'No'}
              </GridItem>

              <GridItem>
                <Text fontWeight="bold">Restrictions</Text>
              </GridItem>
              <GridItem>{pantry.restrictions.join(', ')}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Activities</Text>
              </GridItem>
              <GridItem>{pantry.activities.join(', ')}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Activities Comments</Text>
              </GridItem>
              <GridItem>{pantry.activitiesComments ?? ''}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Items in Stock</Text>
              </GridItem>
              <GridItem>{pantry.itemsInStock}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Need More Options</Text>
              </GridItem>
              <GridItem>{pantry.needMoreOptions}</GridItem>
            </Grid>
          </Dialog.Body>
          <Dialog.Footer>
            <Button bg="blue" onClick={onClose}>
              Close
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default PantryApplicationModal;
