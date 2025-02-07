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
  Table,
  Tbody,
  Tr,
  Td,
  Th,
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
  const [loading, setLoading] = useState<boolean>(true);

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
            <Table variant="simple">
              <Tbody>
                <Tr>
                  <Th>Pantry Name</Th>
                  <Td>{pantry.pantryName}</Td>
                </Tr>
                <Tr>
                  <Th>Address</Th>
                  <Td>{pantry.address}</Td>
                </Tr>
                <Tr>
                  <Th>Dedicated Allergen Friendly</Th>
                  <Td>{pantry.dedicatedAllergenFriendly}</Td>
                </Tr>
                <Tr>
                  <Th>Client Visit Frequency</Th>
                  <Td>{pantry.clientVisitFrequency}</Td>
                </Tr>
                <Tr>
                  <Th>Serve Allergic Children</Th>
                  <Td>{pantry.serveAllergicChildren}</Td>
                </Tr>
                <Tr>
                  <Th>Newsletter Subscription</Th>
                  <Td>{pantry.newsletterSubscription ? 'Yes' : 'No'}</Td>
                </Tr>
              </Tbody>
            </Table>

            {loading ? (
              <p>Loading user details...</p>
            ) : user ? (
              <Table variant="simple" mt={4}>
                <Tbody>
                  <Tr>
                    <Th>Representative Name</Th>
                    <Td>
                      {user.firstName} {user.lastName}
                    </Td>
                  </Tr>
                  <Tr>
                    <Th>Email</Th>
                    <Td>{user.email}</Td>
                  </Tr>
                  <Tr>
                    <Th>Phone</Th>
                    <Td>{user.phone}</Td>
                  </Tr>
                  <Tr>
                    <Th>Role</Th>
                    <Td>{user.role}</Td>
                  </Tr>
                </Tbody>
              </Table>
            ) : (
              <p>No user details available.</p>
            )}
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
