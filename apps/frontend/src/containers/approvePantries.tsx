import React, { useEffect, useState } from 'react';
import { Center, Table, Tbody, Tr, Td, Button, Select } from '@chakra-ui/react';
import PantryApplicationModalButton from '@components/forms/pantryApplicationModalButton';

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
  dateApplied: string;
}

const ApprovePantries: React.FC = () => {
  const [unapprovedPantries, setUnapprovedPantries] = useState<Pantry[]>([]);
  const [sortedPantries, setSortedPantries] = useState<Pantry[]>([]);
  const [sort, setSort] = useState<string>('');

  const getAllUnapprovedPantries = async (): Promise<Pantry[]> => {
    try {
      const response = await fetch(`/api/pantries/nonApproved`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
      alert('Error approving pantry ' + error);
    }
  };

  useEffect(() => {
    const fetchPantries = async () => {
      const data = await getAllUnapprovedPantries();
      setUnapprovedPantries(data);
    };
    fetchPantries();
  }, []);

  useEffect(() => {
    const sorted = [...unapprovedPantries];

    if (sort === 'name') {
      sorted.sort((a, b) => a.pantryName.localeCompare(b.pantryName));
    } else if (sort === 'date-recent') {
      sorted.sort(
        (a, b) =>
          new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime(),
      );
    } else if (sort === 'date-oldest') {
      sorted.sort(
        (a, b) =>
          new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime(),
      );
    }

    setSortedPantries(sorted);
  }, [sort, unapprovedPantries]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Center flexDirection="column" p={4}>
      <Select
        width="40%"
        mb={4}
        placeholder="Sort By"
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="name">Pantry Name (A-Z)</option>
        <option value="date-recent">Date Applied (Most Recent)</option>
        <option value="date-oldest">Date Applied (Oldest First)</option>
      </Select>

      <Table variant="simple" mt={6} width="80%">
        <Tbody>
          {sortedPantries.map((pantry) => (
            <Tr key={pantry.pantryId}>
              <Td>{pantry.pantryId}</Td>
              <Td>
                <PantryApplicationModalButton pantry={pantry} />
              </Td>
              <Td>{formatDate(pantry.dateApplied)}</Td>
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
