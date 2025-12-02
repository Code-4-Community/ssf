import React, { useEffect, useState } from 'react';
import { Button, Dialog, Grid, GridItem, Text } from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { Pantry } from 'types/types';

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
  const pantryUser = pantry.pantryUser;
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
            {pantryUser ? (
              <Grid templateColumns="2fr 1fr" gap={4}>
                <GridItem>
                  <Text fontWeight="bold">Pantry User Name</Text>
                </GridItem>

                <GridItem>
                  {pantryUser.firstName} {pantryUser.lastName}
                </GridItem>

                <GridItem>
                  <Text fontWeight="bold">Email</Text>
                </GridItem>
                <GridItem>{pantryUser.email}</GridItem>

                <GridItem>
                  <Text fontWeight="bold">Phone</Text>
                </GridItem>
                <GridItem>{pantryUser.phone}</GridItem>

                <GridItem>
                  <Text fontWeight="bold">Role</Text>
                </GridItem>
                <GridItem>{pantryUser.role}</GridItem>
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
                <Text fontWeight="bold">Shipping AddressLine 1</Text>
              </GridItem>
              <GridItem>{pantry.shippingAddressLine1}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Shipping AddressLine 2</Text>
              </GridItem>
              <GridItem>{pantry.shippingAddressLine2 ?? ''}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Shipping AddressCity</Text>
              </GridItem>
              <GridItem>{pantry.shippingAddressCity}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Shipping AddressState</Text>
              </GridItem>
              <GridItem>{pantry.shippingAddressState}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Shipping AddressZip</Text>
              </GridItem>
              <GridItem>{pantry.shippingAddressZip}</GridItem>

              <GridItem>
                <Text fontWeight="bold">Shipping AddressCountry</Text>
              </GridItem>
              <GridItem>{pantry.shippingAddressCountry ?? ''}</GridItem>

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
