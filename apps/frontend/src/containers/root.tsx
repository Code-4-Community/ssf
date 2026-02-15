import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';

const Root: React.FC = () => {
  useAuth();

  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
};

export default Root;
