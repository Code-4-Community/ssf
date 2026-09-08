import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import Root from '@containers/root';
import NotFound from '@containers/404';
import FormRequests from '@containers/formRequests';
import PantryApplication from '@containers/pantryApplication';
import ApplicationSubmitted from '@containers/applicationSubmitted';
import { submitPantryApplicationForm } from '@components/forms/pantryApplicationForm';
import ApprovePantries from '@containers/approvePantries';
import PantryApplicationDetails from '@containers/pantryApplicationDetails';
import VolunteerManagement from '@containers/userManagement';
import AdminDonation from '@containers/adminDonation';
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
import AdminPantryManagement from '@containers/adminPantryManagement';
import AdminFoodManufacturerManagement from '@containers/adminFoodManufacturerManagement';
import AdminRequestManagement from '@containers/adminRequestManagement';
import PantryDashboard from '@containers/pantryDashboard';
import VolunteerDashboard from '@containers/volunteerDashboard';
import AdminDashboard from '@containers/adminDashboard';
import FoodManufacturerDashboard from '@containers/foodManufacturerDashboard';
import { Role } from './types/types';

Amplify.configure(CognitoAuthConfig);

const PANTRY_ONLY = [Role.PANTRY];
const VOLUNTEER_ONLY = [Role.VOLUNTEER];
const FOOD_MANUFACTURER_ONLY = [Role.FOODMANUFACTURER];
const ADMIN_ONLY = [Role.ADMIN];
const ADMIN_OR_VOLUNTEER = [Role.ADMIN, Role.VOLUNTEER];

const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      // Public routes (no auth needed)
      {
        index: true,
        element: <Navigate to={ROUTES.LOGIN} replace />,
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
      // Protected routes below (require auth)
      {
        path: ROUTES.REQUEST_FORM,
        element: (
          <ProtectedRoute allowedRoles={PANTRY_ONLY}>
            <FormRequests />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PANTRY_DASHBOARD,
        element: (
          <ProtectedRoute allowedRoles={PANTRY_ONLY}>
            <PantryDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.VOLUNTEER_DASHBOARD,
        element: (
          <ProtectedRoute allowedRoles={VOLUNTEER_ONLY}>
            <VolunteerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.FM_DONATION_MANAGEMENT,
        element: (
          <ProtectedRoute allowedRoles={FOOD_MANUFACTURER_ONLY}>
            <FoodManufacturerDonationManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.FM_DASHBOARD,
        element: (
          <ProtectedRoute allowedRoles={FOOD_MANUFACTURER_ONLY}>
            <FoodManufacturerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.APPROVE_PANTRIES,
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ONLY}>
            <ApprovePantries />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.APPROVE_FOOD_MANUFACTURERS,
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ONLY}>
            <ApproveFoodManufacturers />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PANTRY_APPLICATION_DETAILS,
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ONLY}>
            <PantryApplicationDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PANTRY_MANAGEMENT_DETAILS,
        element: (
          <ProtectedRoute allowedRoles={ADMIN_OR_VOLUNTEER}>
            <PantryApplicationDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.FOOD_MANUFACTURER_APPLICATION_DETAILS,
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ONLY}>
            <FoodManufacturerApplicationDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.FOOD_MANUFACTURER_MANAGEMENT_DETAILS,
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ONLY}>
            <FoodManufacturerApplicationDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_DONATION,
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ONLY}>
            <AdminDonation />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_DONATION_STATS,
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ONLY}>
            <AdminDonationStats />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.VOLUNTEER_MANAGEMENT,
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ONLY}>
            <VolunteerManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_DASHBOARD,
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ONLY}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_REQUEST_MANAGEMENT,
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ONLY}>
            <AdminRequestManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_ORDER_MANAGEMENT,
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ONLY}>
            <AdminOrderManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PANTRY_ORDER_MANAGEMENT,
        element: (
          <ProtectedRoute allowedRoles={PANTRY_ONLY}>
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
          <ProtectedRoute allowedRoles={VOLUNTEER_ONLY}>
            <AssignedPantries />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.VOLUNTEER_REQUEST_MANAGEMENT,
        element: (
          <ProtectedRoute allowedRoles={VOLUNTEER_ONLY}>
            <VolunteerRequestManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.VOLUNTEER_ORDER_MANAGEMENT,
        element: (
          <ProtectedRoute allowedRoles={VOLUNTEER_ONLY}>
            <VolunteerOrderManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.PANTRY_MANAGEMENT,
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ONLY}>
            <AdminPantryManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.FOOD_MANUFACTURER_MANAGEMENT,
        element: (
          <ProtectedRoute allowedRoles={ADMIN_ONLY}>
            <AdminFoodManufacturerManagement />
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
