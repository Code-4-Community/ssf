import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import apiClient from '@api/apiClient';
import Root from '@containers/root';
import NotFound from '@containers/404';
import LandingPage from '@containers/landingPage';
import PantryOverview from '@containers/pantryOverview';
import PantryPastOrders from '@containers/pantryPastOrders';
import Pantries from '@containers/pantries';
import Orders from '@containers/orders';
import PantryDashboard from '@containers/pantryDashboard';
import { submitFoodRequestFormModal } from '@components/forms/requestFormModalButton';
import { submitDeliveryConfirmationFormModal } from '@components/forms/deliveryConfirmationModalButton';
import FormRequests from '@containers/FormRequests';
import PantryApplication from '@containers/pantryApplication';
import { submitPantryApplicationForm } from '@components/forms/pantryApplicationForm';
import ApprovePantries from '@containers/approvePantries';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import CognitoAuthConfig from './aws-exports';
import { Button } from '@chakra-ui/react';
import { Hub, HubCapsule } from 'aws-amplify/utils';
import { AuthHubEventData } from '@aws-amplify/core/dist/esm/Hub/types';
import { fetchAuthSession } from 'aws-amplify/auth';

Amplify.configure(CognitoAuthConfig);

function signInListener(data: HubCapsule<'auth', AuthHubEventData>) {
  if (data.payload.event !== 'signedIn') {
    return;
  }

  console.log(fetchAuthSession());
}

Hub.listen('auth', signInListener);

const components = {
  SignUp: {
    Footer() {
      return (
        <>
          <Button as="a" href="/pantry-application">
            {' '}
            Sign up to be pantry partner{' '}
          </Button>
          <Button> Log donation for one-time donors </Button>
        </>
      );
    },
  },

  SignIn: {
    Footer() {
      return (
        <>
          <Button as="a" href="/pantry-application">
            {' '}
            Sign up to be pantry partner{' '}
          </Button>
          <Button> Log donation for one-time donors </Button>
        </>
      );
    },
  },
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      // Public routes (no auth needed)

      {
        path: '/pantry-application',
        element: <PantryApplication />,
        action: submitPantryApplicationForm,
      },

      // Private routes (protected by auth)

      {
        path: '/landing-page',
        element: (
          <Authenticator components={components}>
            <LandingPage />
          </Authenticator>
        ),
      },
      {
        path: '/pantry-overview',
        element: (
          <Authenticator components={components}>
            <PantryOverview />
          </Authenticator>
        ),
      },
      {
        path: '/pantry-dashboard/:pantryId',
        element: (
          <Authenticator components={components}>
            <PantryDashboard />
          </Authenticator>
        ),
      },
      {
        path: '/pantry-past-orders',
        element: (
          <Authenticator components={components}>
            <PantryPastOrders />
          </Authenticator>
        ),
      },
      {
        path: '/pantries',
        element: (
          <Authenticator components={components}>
            <Pantries />
          </Authenticator>
        ),
      },
      {
        path: '/orders',
        element: (
          <Authenticator components={components}>
            <Orders />
          </Authenticator>
        ),
      },
      {
        path: '/request-form/:pantryId',
        element: (
          <Authenticator components={components}>
            <FormRequests />
          </Authenticator>
        ),
      },
      {
        path: '/approve-pantries',
        element: (
          <Authenticator components={components}>
            <ApprovePantries />
          </Authenticator>
        ),
      },

      // Actions

      {
        path: '/food-request',
        action: submitFoodRequestFormModal,
      },
      {
        path: '/confirm-delivery',
        action: submitDeliveryConfirmationFormModal,
      },
    ],
  },
]);

export const App: React.FC = () => {
  useEffect(() => {
    document.title = 'SSF';
    apiClient.getHello().then((res) => console.log(res));
  }, []);

  return (
    <Authenticator.Provider>
      <RouterProvider router={router} />
    </Authenticator.Provider>
  );
};

export default App;
