import React, { useEffect, useState } from 'react';
import {
  Center,
  Table,
  Button,
  Link,
  NativeSelect,
  NativeSelectIndicator,
} from '@chakra-ui/react';
import PantryApplicationModal from '@components/forms/pantryApplicationModal';
import ApiClient from '@api/apiClient';
import { Pantry } from 'types/pantryTypes';
import { formatDate } from '@utils/utils';

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

  return (
    <Center flexDirection="column" p={4}>
      <NativeSelect.Root width="40%" mb={4}>
        <NativeSelect.Field
          placeholder="Sort By"
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="name">Pantry Name (A-Z)</option>
          <option value="name-reverse">Pantry Name (Z-A)</option>
          <option value="date-recent">Date Applied (Most Recent)</option>
          <option value="date-oldest">Date Applied (Oldest First)</option>
        </NativeSelect.Field>
        <NativeSelectIndicator />
      </NativeSelect.Root>

      <Table.Root variant="line" mt={6} width="80%">
        <Table.Body>
          {sortedPantries.map((pantry) => (
            <Table.Row key={pantry.pantryId}>
              <Table.Cell>{pantry.pantryId}</Table.Cell>
              <Table.Cell>
                <Button
                  asChild
                  bg="transparent"
                  color="cyan"
                  fontWeight="600"
                  onClick={() => setOpenPantry(pantry)}
                >
                  <Link>{pantry.pantryName}</Link>
                </Button>
              </Table.Cell>
              <Table.Cell>{formatDate(pantry.dateApplied)}</Table.Cell>
              <Table.Cell>
                <Button
                  bg="green.600"
                  fontWeight="600"
                  onClick={() => updatePantry(pantry.pantryId, 'approve')}
                >
                  Approve
                </Button>
              </Table.Cell>
              <Table.Cell>
                <Button
                  bg="red"
                  fontWeight="600"
                  onClick={() => updatePantry(pantry.pantryId, 'deny')}
                >
                  Deny
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
          {openPantry && (
            <PantryApplicationModal
              pantry={openPantry}
              isOpen={openPantry !== null}
              onClose={() => setOpenPantry(null)}
            />
          )}
        </Table.Body>
      </Table.Root>
    </Center>
  );
};

export default ApprovePantries;
