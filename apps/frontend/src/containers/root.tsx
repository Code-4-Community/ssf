import { Outlet } from 'react-router-dom';
import Header from '@components/Header';
import { SSFLoginForm, PantryLoginForm } from '@components/forms/loginForm';
import { useState } from 'react';
const Root: React.FC = () => {
  const [ssf, setSSF] = useState(false);
  return (
    <div>
      <Header />
      <Outlet />
      {ssf ? <SSFLoginForm /> : <PantryLoginForm />}
      <button onClick={() => setSSF(!ssf)}>Switch</button>
    </div>
  );
};

export default Root;
