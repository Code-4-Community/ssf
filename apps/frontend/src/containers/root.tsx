import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import apiClient from '@api/apiClient';

const Root: React.FC = () => {
  const navigate = useNavigate();
  
  useAuth();

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