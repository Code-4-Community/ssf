import React, { useCallback } from 'react';
import ApiClient from '@api/apiClient';
import RequestManagement from '@components/foodRequestManagement';
import { useSearchParams } from 'react-router-dom';

const VolunteerRequestManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requestIdParam = searchParams.get('requestId');
  const initialRequestId = requestIdParam ? Number(requestIdParam) : undefined;

  const fetchRequests = useCallback(
    () => ApiClient.getVolunteerAssignedRequests(),
    [],
  );

  return (
    <RequestManagement
      fetchRequests={fetchRequests}
      initialRequestId={initialRequestId}
    />
  );
};

export default VolunteerRequestManagement;
