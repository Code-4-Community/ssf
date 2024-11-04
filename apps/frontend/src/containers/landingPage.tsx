import { PantryLoginForm, SSFLoginForm } from '@components/forms/loginForm';
import { useState } from 'react';

const LandingPage: React.FC = () => {
  const [ssf, setSSF] = useState(false);
  return (
    <>
      {ssf ? <SSFLoginForm /> : <PantryLoginForm />}
      <button onClick={() => setSSF(!ssf)}>Switch</button>
    </>
  );
};

export default LandingPage;
