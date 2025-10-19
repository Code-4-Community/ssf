import React, { useEffect, useState } from 'react';
import { Center, Table, Tbody, Tr, Td, Button, Select } from '@chakra-ui/react';
import PantryApplicationModal from '@components/forms/pantryApplicationModal';
import ApiClient from '@api/apiClient';
import { Pantry } from 'types/types';

const ApprovePantries: React.FC = () => {
  const [pendingPantries, setPendingPantries] = useState<Pantry[]>([]);
  const [sortedPantries, setSortedPantries] = useState<Pantry[]>([]);
  const [sort, setSort] = useState<string>('');
  const [openPantry, setOpenPantry] = useState<Pantry | null>(null);

  const fetchPantries = async () => {
    try {
      const data = await ApiClient.getAllPendingPantries();
      setPendingPantries(data);
    } catch (error) {
      alert('Error fetching unapproved pantries: ' + error);
    }
  };

  const updatePantry = async (
    pantryId: number,
    decision: 'approve' | 'deny',
  ) => {
    try {
      await ApiClient.updatePantry(pantryId, decision);
      setPendingPantries((prev) => prev.filter((p) => p.pantryId !== pantryId));
    } catch (error) {
      alert(`Error ${decision} pantry: ` + error);
    }
  };

  useEffect(() => {
    fetchPantries();
  }, []);

  useEffect(() => {
    const sorted = [...pendingPantries];

    if (sort === 'name') {
      sorted.sort((a, b) => a.pantryName.localeCompare(b.pantryName));
    } else if (sort === 'name-reverse') {
      sorted.sort((a, b) => b.pantryName.localeCompare(a.pantryName));
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
  }, [sort, pendingPantries]);

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
        <option value="name-reverse">Pantry Name (Z-A)</option>
        <option value="date-recent">Date Applied (Most Recent)</option>
        <option value="date-oldest">Date Applied (Oldest First)</option>
      </Select>

      <Table variant="simple" mt={6} width="80%">
        <Tbody>
          {sortedPantries.map((pantry) => (
            <Tr key={pantry.pantryId}>
              <Td>{pantry.pantryId}</Td>
              <Td>
                <Button
                  variant="link"
                  colorScheme="blue"
                  onClick={() => setOpenPantry(pantry)}
                >
                  {pantry.pantryName}
                </Button>
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
          {openPantry && (
            <PantryApplicationModal
              pantry={openPantry}
              isOpen={openPantry !== null}
              onClose={() => setOpenPantry(null)}
            />
          )}
        </Tbody>
      </Table>
    </Center>
  );
};

export default ApprovePantries;
