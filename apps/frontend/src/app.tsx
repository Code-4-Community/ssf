import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import apiClient from '@api/apiClient';
import Root from '@containers/root';
import NotFound from '@containers/404';
import { submitFoodRequestForm } from '@components/forms/foodRequestForm';
import RequestFood from '@containers/foodRequest';
import DeliveryConfirmation from '@containers/FormRequests';
import LandingPage from '@containers/landingPage';
import PantryOverview from '@containers/pantryOverview';
import PantryPastOrders from '@containers/pantryPastOrders';
import Pantries from '@containers/pantries';
import Orders from '@containers/orders';

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
    ],
  },
  {
    path: '/food-request',
    element: <RequestFood />,
    action: submitFoodRequestForm,
  },
  {
    path: '/delivery-confirmation',
    element: <DeliveryConfirmation />,
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
