import React from 'react';
import ApiClient from '@api/apiClient';
import RequestManagement from '@components/foodRequestManagement';

const AdminRequestManagement: React.FC = () => (
  <RequestManagement
    fetchRequests={() => ApiClient.getAllFoodRequests()}
    showActionColumn={false}
  />
);

export default AdminRequestManagement;
