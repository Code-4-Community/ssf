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
import { submitFoodRequestFormModal } from '@components/forms/requestFormModal';
import { submitDeliveryConfirmationFormModal } from '@components/forms/deliveryConfirmationModal';
import FormRequests from '@containers/FormRequests';
import PantryApplication from '@containers/pantryApplication';
import { submitPantryApplicationForm } from '@components/forms/pantryApplicationForm';
import ApprovePantries from '@containers/approvePantries';
import VolunteerManagement from '@containers/volunteerManagement';
import FoodManufacturerOrderDashboard from '@containers/foodManufacturerOrderDashboard';
import DonationManagement from '@containers/donationManagement';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/landing-page',
        element: <LandingPage />,
      },
      {
        path: '/pantry-overview',
        element: <PantryOverview />,
      },
      {
        path: '/pantry-dashboard/:pantryId',
        element: <PantryDashboard />,
      },
      {
        path: '/pantry-past-orders',
        element: <PantryPastOrders />,
      },
      {
        path: '/pantries',
        element: <Pantries />,
      },
      {
        path: '/pantry-application',
        element: <PantryApplication />,
        action: submitPantryApplicationForm,
      },
      {
        path: '/food-manufacturer-order-dashboard',
        element: <FoodManufacturerOrderDashboard />,
      },
      {
        path: '/orders',
        element: <Orders />,
      },
      {
        path: '/request-form/:pantryId',
        element: <FormRequests />,
      },
      {
        path: '/donation-management',
        element: <DonationManagement />,
      },
      {
        path: '/food-request',
        action: submitFoodRequestFormModal,
      },
      {
        path: '/confirm-delivery',
        action: submitDeliveryConfirmationFormModal,
      },
      {
        path: '/approve-pantries',
        element: <ApprovePantries />,
      },
      {
        path: '/volunteer-management',
        element: <VolunteerManagement />,
      },
    ],
  },
]);

export const App: React.FC = () => {
  useEffect(() => {
    document.title = 'SSF';
    apiClient.getHello().then((res) => console.log(res));
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
