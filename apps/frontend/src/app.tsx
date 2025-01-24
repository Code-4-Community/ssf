import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import apiClient from '@api/apiClient';
import Root from '@containers/root';
import NotFound from '@containers/404';
import { submitFoodRequestForm } from '@components/forms/foodRequestForm';
import RequestFood from '@containers/foodRequest';
import LandingPage from '@containers/landingPage';
import PantryOverview from '@containers/pantryOverview';
import PantryPastOrders from '@containers/pantryPastOrders';
import Pantries from '@containers/pantries';
import Orders from '@containers/orders';
import FormRequests from '@containers/FormRequests';

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
    // TODO: Later on, this path should determine the id used in the GET request inside this component
    path: '/request-form',
    element: <FormRequests />,
    action: submitFoodRequestForm,
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
