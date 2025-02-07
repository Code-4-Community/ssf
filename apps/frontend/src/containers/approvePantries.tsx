import React, { useEffect, useState } from 'react';
import {
  Center,
  Table,
  Text,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Button,
} from '@chakra-ui/react';
import PantryApplicationModalButton from '@components/forms/pantryApplicationModalButton';

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

const ApprovePantries: React.FC = () => {
  const [unapprovedPantries, setUnapprovedPantries] = useState<Pantry[]>([]);

  const getAllUnapprovedPantries = async (): Promise<Pantry[]> => {
    try {
      const response = await fetch(`/api/pantries/nonApproved`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        alert('Failed to fetch unapproved pantries ' + (await response.text()));
        return [];
      }
    } catch (error) {
      alert('Error fetching unapproved pantries ' + error);
      return [];
    }
  };

  const updatePantry = async (pantryId: number, decision: string) => {
    try {
      const response = await fetch(`/api/pantries/${decision}/${pantryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pantryId }),
      });

      if (response.ok) {
        setUnapprovedPantries((prev) =>
          prev.filter((p) => p.pantryId !== pantryId),
        );
      } else {
        alert('Failed to approve pantry' + (await response.text()));
      }
    } catch (error) {
      alert('Error approving pantry' + error);
    }
  };

  useEffect(() => {
    const fetchPantries = async () => {
      const data = await getAllUnapprovedPantries();
      setUnapprovedPantries(data);
    };
    fetchPantries();
  }, []);

  return (
    <Center flexDirection="column" p={4}>
      <Table variant="simple" mt={6} width="80%">
        <Tbody>
          {unapprovedPantries.map((pantry) => (
            <Tr key={pantry.pantryId}>
              <Td>{pantry.pantryId}</Td>
              <Td>
                <PantryApplicationModalButton pantry={pantry} />
              </Td>
              <Td>
                <Button
                  colorScheme="green"
                  onClick={() => updatePantry(pantry.pantryId, 'approve')}
                >
                  Approve
                </Button>
              </Td>
              <Td>
                <Button
                  colorScheme="red"
                  onClick={() => updatePantry(pantry.pantryId, 'deny')}
                >
                  Deny
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Center>
  );
};

export default ApprovePantries;
