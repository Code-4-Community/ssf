import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Center,
  Table,
  Button,
  Link,
  NativeSelect,
  NativeSelectIndicator,
} from '@chakra-ui/react';
import ApiClient from '@api/apiClient';
import { Pantry } from 'types/types';
import { formatDate } from '@utils/utils';
import { FloatingAlert } from '@components/floatingAlert';

const ApprovePantries: React.FC = () => {
  const navigate = useNavigate();
  const [pendingPantries, setPendingPantries] = useState<Pantry[]>([]);
  const [sortedPantries, setSortedPantries] = useState<Pantry[]>([]);
  const [sort, setSort] = useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [alert, setAlert] = useState<{
    message: string;
    key: number;
  }>({ message: '', key: 0 });

  const fetchPantries = async () => {
    try {
      const data = await ApiClient.getAllPendingPantries();
      setPendingPantries(data);
    } catch {
      setAlert((prev) => ({
        message: 'Error fetching pantries',
        key: prev.key + 1,
      }));
    }
  };

  const updatePantry = async (
    pantryId: number,
    decision: 'approve' | 'deny',
  ) => {
    try {
      await ApiClient.updatePantry(pantryId, decision);
      setPendingPantries((prev) => prev.filter((p) => p.pantryId !== pantryId));
    } catch {
      setAlert((prev) => ({
        message: `Error ${decision} pantry`,
        key: prev.key + 1,
      }));
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

  useEffect(() => {
    const action = searchParams.get('action');
    const name = searchParams.get('name');

    if (action && name) {
      const message =
        action === 'approved'
          ? `${name} - Application Accepted`
          : `${name} - Application Rejected`;

      setAlert((prev) => ({ message, key: prev.key + 1 }));
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  return (
    <Center flexDirection="column" p={4}>
      {alert && (
        <FloatingAlert
          key={alert.key}
          message={alert.message}
          status="info"
          timeout={6000}
        />
      )}
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
                  onClick={() =>
                    navigate(`/pantry-application-details/${pantry.pantryId}`)
                  }
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
        </Table.Body>
      </Table.Root>
    </Center>
  );
};

export default ApprovePantries;
