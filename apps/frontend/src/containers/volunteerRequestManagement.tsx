import React from 'react';
import ApiClient from '@api/apiClient';
import RequestManagement from '@components/foodRequestManagement';

const VolunteerRequestManagement: React.FC = () => (
  <RequestManagement
    fetchRequests={() => ApiClient.getVolunteerAssignedRequests()}
  />
);

export default VolunteerRequestManagement;
