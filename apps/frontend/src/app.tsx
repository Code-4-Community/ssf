import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from '@containers/root';
import NotFound from '@containers/404';
import FormRequests from '@containers/formRequests';
import PantryApplication from '@containers/pantryApplication';
import ApplicationSubmitted from '@containers/applicationSubmitted';
import { submitPantryApplicationForm } from '@components/forms/pantryApplicationForm';
import ApprovePantries from '@containers/approvePantries';
import PantryApplicationDetails from '@containers/pantryApplicationDetails';
import VolunteerManagement from '@containers/volunteerManagement';
import AdminDonation from '@containers/adminDonation';
import Homepage from '@containers/homepage';
import AdminOrderManagement from '@containers/adminOrderManagement';
import { Amplify } from 'aws-amplify';
import CognitoAuthConfig from './aws-exports';
import { ROUTES } from './routes';
import FoodManufacturerDonationManagement from '@containers/foodManufacturerDonationManagement';
import LoginPage from '@containers/loginPage';
import SignupPage from '@containers/signupPage';
import ForgotPasswordPage from '@containers/forgotPasswordPage';
import ProtectedRoute from '@components/protectedRoute';
import Unauthorized from '@containers/unauthorized';
import { Authenticator } from '@aws-amplify/ui-react';
import PantryOrderManagement from '@containers/pantryOrderManagement';
import FoodManufacturerApplication from '@containers/foodManufacturerApplication';
import { submitManufacturerApplicationForm } from '@components/forms/manufacturerApplicationForm';
import AssignedPantries from '@containers/volunteerAssignedPantries';
import ApproveFoodManufacturers from '@containers/approveFoodManufacturers';
import FoodManufacturerApplicationDetails from '@containers/foodManufacturerApplicationDetails';
import VolunteerRequestManagement from '@containers/volunteerRequestManagement';
import AdminDonationStats from '@containers/adminDonationStats';
import ProfilePage from '@containers/profilePage';
import VolunteerOrderManagement from '@containers/volunteerOrderManagement';
import TestAdminDashboard from '@containers/testAdminDashboard';
import AdminRequestManagement from '@containers/adminRequestManagement';

Amplify.configure(CognitoAuthConfig);

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      // Public routes (no auth needed)
      {
        index: true,
        element: <Homepage />,
      },
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.SIGNUP,
        element: <SignupPage />,
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        element: <ForgotPasswordPage />,
      },
      {
        path: ROUTES.PANTRY_APPLICATION,
        element: <PantryApplication />,
        action: submitPantryApplicationForm,
      },
      {
        path: ROUTES.FOOD_MANUFACTURER_APPLICATION,
        element: <FoodManufacturerApplication />,
        action: submitManufacturerApplicationForm,
      },
      {
        path: ROUTES.APPLICATION_SUBMITTED,
        element: <ApplicationSubmitted />,
      },
      {
        path: ROUTES.UNAUTHORIZED,
        element: <Unauthorized />,
      },
      {
        path: ROUTES.REQUEST_FORM,
        element: (
          <ProtectedRoute>
            <FormRequests />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.FM_DONATION_MANAGEMENT,
        element: (
          <ProtectedRoute>
            <FoodManufacturerDonationManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.APPROVE_PANTRIES,
        element: (
          <ProtectedRoute>
            <ApprovePantries />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.APPROVE_FOOD_MANUFACTURERS,
        element: (
          <ProtectedRoute>
            <ApproveFoodManufacturers />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PANTRY_APPLICATION_DETAILS,
        element: (
          <ProtectedRoute>
            <PantryApplicationDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.FOOD_MANUFACTURER_APPLICATION_DETAILS,
        element: (
          <ProtectedRoute>
            <FoodManufacturerApplicationDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_DONATION,
        element: (
          <ProtectedRoute>
            <AdminDonation />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_DONATION_STATS,
        element: (
          <ProtectedRoute>
            <AdminDonationStats />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.VOLUNTEER_MANAGEMENT,
        element: (
          <ProtectedRoute>
            <VolunteerManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.TEST_ADMIN_DASHBOARD,
        element: (
          <ProtectedRoute>
            <TestAdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_REQUEST_MANAGEMENT,
        element: (
          <ProtectedRoute>
            <AdminRequestManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_ORDER_MANAGEMENT,
        element: (
          <ProtectedRoute>
            <AdminOrderManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PANTRY_ORDER_MANAGEMENT,
        element: (
          <ProtectedRoute>
            <PantryOrderManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PROFILE,
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.VOLUNTEER_ASSIGNED_PANTRIES,
        element: (
          <ProtectedRoute>
            <AssignedPantries />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.VOLUNTEER_REQUEST_MANAGEMENT,
        element: (
          <ProtectedRoute>
            <VolunteerRequestManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.VOLUNTEER_ORDER_MANAGEMENT,
        element: (
          <ProtectedRoute>
            <VolunteerOrderManagement />
          </ProtectedRoute>
        ),
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
