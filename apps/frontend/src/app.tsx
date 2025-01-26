import { useEffect } from 'react';
import { createBrowserRouter, Form, RouterProvider } from 'react-router-dom';

import apiClient from '@api/apiClient';
import Root from '@containers/root';
import NotFound from '@containers/404';
import LandingPage from '@containers/landingPage';
import PantryOverview from '@containers/pantryOverview';
import PantryPastOrders from '@containers/pantryPastOrders';
import Pantries from '@containers/pantries';
import Orders from '@containers/orders';
import FormRequests from '@containers/FormRequests';
import { submitDeliveryConfirmationFormModal } from '@components/forms/deliveryConfirmationModalButton';
import { submitFoodRequestFormModal } from '@components/forms/requestFormModalButton';

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
        path: '/pantry-past-orders',
        element: <PantryPastOrders />,
      },
      {
        path: '/pantries',
        element: <Pantries />,
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

  return <RouterProvider router={router} />;
};

export default App;
