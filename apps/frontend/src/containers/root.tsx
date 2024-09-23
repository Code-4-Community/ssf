import { Outlet } from 'react-router-dom';
import Header from '../../components/Header';
const Root: React.FC = () => {
  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
};

export default Root;
