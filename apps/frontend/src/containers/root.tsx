import Header from '@components/Header';
import { Outlet } from 'react-router-dom';

const Root: React.FC = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default Root;
