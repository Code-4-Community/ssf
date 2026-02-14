import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from '@containers/root';
import NotFound from '@containers/404';
import LandingPage from '@containers/landingPage';
import PantryOverview from '@containers/pantryOverview';
import PantryPastOrders from '@containers/pantryPastOrders';
import Pantries from '@containers/pantries';
import Orders from '@containers/orders';
import PantryDashboard from '@containers/pantryDashboard';
import submitFoodRequestFormModal from '@components/forms/requestFormModal';
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
import Homepage from '@containers/homepage';
import AdminOrderManagement from '@containers/adminOrderManagement';
import { Amplify } from 'aws-amplify';
import CognitoAuthConfig from './aws-exports';
import LoginPage from '@containers/loginPage';
import SignupPage from '@containers/signupPage';
import ForgotPasswordPage from '@containers/forgotPasswordPage';
import ProtectedRoute from '@components/protectedRoute';
import Unauthorized from '@containers/unauthorized';
import { Authenticator } from '@aws-amplify/ui-react';

Amplify.configure(CognitoAuthConfig);

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
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/signup',
        element: <SignupPage />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: '/pantry-application',
        element: <PantryApplication />,
        action: submitPantryApplicationForm,
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
          <ProtectedRoute>
            <PantryOverview />
          </ProtectedRoute>
        ),
      },
      {
        path: '/pantry-past-orders',
        element: (
          <ProtectedRoute>
            <PantryPastOrders />
          </ProtectedRoute>
        ),
      },
      {
        path: '/pantries',
        element: (
          <ProtectedRoute>
            <Pantries />
          </ProtectedRoute>
        ),
      },
      {
        path: '/pantry-overview',
        element: (
          <ProtectedRoute>
            <PantryOverview />
          </ProtectedRoute>
        ),
      },
      {
        path: '/pantry-dashboard',
        element: (
          <ProtectedRoute>
            <PantryDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/pantry-past-orders',
        element: (
          <ProtectedRoute>
            <PantryPastOrders />
          </ProtectedRoute>
        ),
      },
      {
        path: '/pantries',
        element: (
          <ProtectedRoute>
            <Pantries />
          </ProtectedRoute>
        ),
      },
      {
        path: '/food-manufacturer-order-dashboard',
        element: (
          <ProtectedRoute>
            <FoodManufacturerOrderDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: '/orders',
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
      {
        path: '/request-form',
        element: (
          <ProtectedRoute>
            <FormRequests />
          </ProtectedRoute>
        ),
      },
      {
        path: '/donation-management',
        element: (
          <ProtectedRoute>
            <DonationManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: '/approve-pantries',
        element: (
          <ProtectedRoute>
            <ApprovePantries />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin-donation',
        element: (
          <ProtectedRoute>
            <AdminDonation />
          </ProtectedRoute>
        ),
      },
      {
        path: '/volunteer-management',
        element: (
          <ProtectedRoute>
            <VolunteerManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin-order-management',
        element: (
          <ProtectedRoute>
            <AdminOrderManagement />
          </ProtectedRoute>
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
  return (
    <Authenticator.Provider>
      <RouterProvider router={router} />
    </Authenticator.Provider>
  );
};

export default App;
