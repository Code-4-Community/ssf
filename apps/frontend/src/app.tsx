import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from '@containers/root';
import NotFound from '@containers/404';
import LandingPage from '@containers/landingPage';
import PantryOverview from '@containers/pantryOverview';
import PantryPastOrders from '@containers/pantryPastOrders';
import Pantries from '@containers/pantries';
import Orders from '@containers/orders';
import PantryDashboard from '@containers/pantryDashboard';
import { submitFoodRequestFormModal } from '@components/forms/requestFormModal';
import { submitDeliveryConfirmationFormModal } from '@components/forms/deliveryConfirmationModal';
import FormRequests from '@containers/FormRequests';
import PantryApplication from '@containers/pantryApplication';
import PantryApplicationSubmitted from '@containers/pantryApplicationSubmitted';
import { submitPantryApplicationForm } from '@components/forms/pantryApplicationForm';
import ApprovePantries from '@containers/approvePantries';
import VolunteerManagement from '@containers/volunteerManagement';
import FoodManufacturerOrderDashboard from '@containers/foodManufacturerOrderDashboard';
import DonationManagement from '@containers/donationManagement';
import AdminDonation from '@containers/adminDonation';
import { pantryIdLoader } from '@loaders/pantryIdLoader';
import Homepage from '@containers/homepage';
import AdminOrderManagement from '@containers/adminOrderManagement';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import CognitoAuthConfig from './aws-exports';
import { Button } from '@chakra-ui/react';
import Unauthorized from '@containers/unauthorized';

Amplify.configure(CognitoAuthConfig);

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
        index: true,
        element: <Homepage />,
      },
      {
        path: '/landing-page',
        element: <LandingPage />,
      },
      {
        path: '/pantry-application',
        element: <PantryApplication />,
        action: submitPantryApplicationForm,
      },

      {
        path: '/unauthorized',
        element: <Unauthorized />,
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
        path: '/pantry-application/submitted',
        element: <PantryApplicationSubmitted />,
      },
      {
        path: '/unauthorized',
        element: <Unauthorized />,
      },
      // Private routes (protected by auth)
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
        loader: pantryIdLoader,
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
        path: '/food-manufacturer-order-dashboard',
        element: (
          <Authenticator components={components}>
            <FoodManufacturerOrderDashboard />
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
        loader: pantryIdLoader,
      },
      {
        path: '/approve-pantries',
        element: (
          <Authenticator components={components}>
            <ApprovePantries />
          </Authenticator>
        ),
      },
      {
        path: '/donation-management',
        element: (
          <Authenticator components={components}>
            <DonationManagement />
          </Authenticator>
        ),
      },
      {
        path: '/admin-donation',
        element: (
          <Authenticator components={components}>
            <AdminDonation />
          </Authenticator>
        ),
      },
      {
        path: '/volunteer-management',
        element: (
          <Authenticator components={components}>
            <VolunteerManagement />
          </Authenticator>
        ),
      },
      {
        path: '/admin-order-management',
        element: (
          <Authenticator components={components}>
            <AdminOrderManagement />
          </Authenticator>
        ),
      },
      // Actions
      {
        path: '/confirm-delivery',
        action: submitDeliveryConfirmationFormModal,
      },
    ],
  },
]);

export const App: React.FC = () => {
  return (
    <Authenticator.Provider>
      <RouterProvider router={router} />
    </Authenticator.Provider>
  );
};

export default App;
