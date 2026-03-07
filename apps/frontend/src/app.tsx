import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from '@containers/root';
import NotFound from '@containers/404';
import LandingPage from '@containers/landingPage';
import PantryOverview from '@containers/pantryOverview';
import PantryPastOrders from '@containers/pantryPastOrders';
import Pantries from '@containers/pantries';
import Orders from '@containers/orders';
import PantryDashboard from '@containers/pantryDashboard';
import { submitDeliveryConfirmationFormModal } from '@components/forms/deliveryConfirmationModal';
import FormRequests from '@containers/formRequests';
import PantryApplication from '@containers/pantryApplication';
import ApplicationSubmitted from '@containers/applicationSubmitted';
import { submitPantryApplicationForm } from '@components/forms/pantryApplicationForm';
import ApprovePantries from '@containers/approvePantries';
import ApplicationDetails from '@containers/applicationDetails';
import VolunteerManagement from '@containers/volunteerManagement';
import FoodManufacturerOrderDashboard from '@containers/foodManufacturerOrderDashboard';
import AdminDonation from '@containers/adminDonation';
import Homepage from '@containers/homepage';
import AdminOrderManagement from '@containers/adminOrderManagement';
import { Amplify } from 'aws-amplify';
import CognitoAuthConfig from './aws-exports';
import FoodManufacturerDonationManagement from '@containers/foodManufacturerDonationManagement';
import LoginPage from '@containers/loginPage';
import SignupPage from '@containers/signupPage';
import ForgotPasswordPage from '@containers/forgotPasswordPage';
import ProtectedRoute from '@components/protectedRoute';
import Unauthorized from '@containers/unauthorized';
import { Authenticator } from '@aws-amplify/ui-react';
import FoodManufacturerApplication from '@containers/foodManufacturerApplication';
import { submitManufacturerApplicationForm } from '@components/forms/manufacturerApplicationForm';

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
        path: '/food-manufacturer-application',
        element: <FoodManufacturerApplication />,
        action: submitManufacturerApplicationForm,
      },
      {
        path: '/application-submitted',
        element: <ApplicationSubmitted />,
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
        path: '/fm-donation-management',
        element: (
          <ProtectedRoute>
            <FoodManufacturerDonationManagement />
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
        path: '/application-details/:applicationId',
        element: (
          <ProtectedRoute>
            <ApplicationDetails />
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
