import React, { useCallback } from 'react';
import ApiClient from '@api/apiClient';
import RequestManagement from '@components/foodRequestManagement';

const AdminRequestManagement: React.FC = () => {
  const fetchRequests = useCallback(() => ApiClient.getAllFoodRequests(), []);

  return (
    <RequestManagement
      fetchRequests={fetchRequests}
      enableVolunteerActions={false}
    />
  );
};

export default AdminRequestManagement;
