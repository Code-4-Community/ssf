import React from 'react';
import {
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
} from '@chakra-ui/react';
import { redirect } from 'react-router-dom';
import FoodRequestFormModal from '@components/forms/requestFormModalButton';
import DeliveryConfirmationModalButton from '@components/forms/deliveryConfirmationModalButton';

const FormRequests: React.FC = () => {
  // Sample data for the table (will use API)
  const requests = [
    {
      requestId: '001',
      dateRequested: '2025-01-20',
      status: 'Pending',
      fulfilledBy: '2025-01-25',
      expectedDeliveryDate: '2025-01-25',
    },
    {
      requestId: '002',
      dateRequested: '2025-01-22',
      status: 'In Progress',
      fulfilledBy: '2025-01-29',
      expectedDeliveryDate: '2025-01-30',
    },
  ];

  // Function to handle redirect
  const handleRedirect = () => {
    return redirect('/confirmFoodDelivery');
  };

  return (
    <Center flexDirection="column" p={4}>
      {/* Food Request Form Modal at the top */}
      <FoodRequestFormModal />

      {/* Table displaying orders */}
      <Table variant="simple" mt={6} width="80%">
        <Thead>
          <Tr>
            <Th>Request Id</Th>
            <Th>Date Requested</Th>
            <Th>Status</Th>
            <Th>Fulfilled By</Th>
            <Th>Expected Delivery Date</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {requests.map((request) => (
            <Tr key={request.requestId}>
              <Td>{request.requestId}</Td>
              <Td>{request.dateRequested}</Td>
              <Td>{request.status}</Td>
              <Td>{request.fulfilledBy}</Td>
              <Td>{request.expectedDeliveryDate}</Td>
              <Td>
                <DeliveryConfirmationModalButton />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Center>
  );
};

export default FormRequests;
