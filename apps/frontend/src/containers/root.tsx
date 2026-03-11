import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useEffect } from 'react';
import apiClient from '@api/apiClient';

const Root: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.setNavigate(navigate);
  }, [navigate]);

  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
};

export default Root;
