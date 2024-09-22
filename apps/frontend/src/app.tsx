import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import apiClient from '@api/apiClient';
import Root from '@containers/root';
import NotFound from '@containers/404';
import Test from '@containers/test';
import RequestFood from '@containers/foodRequest';
import { submitFoodRequestForm } from '@components/forms/foodRequestForm';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <NotFound />,
  },
  {
    path: '/test',
    element: <Test />,
  },
  {
    path: '/food-request',
    element: <RequestFood />,
    action: submitFoodRequestForm,
  },
]);

export const App: React.FC = () => {
  useEffect(() => {
    apiClient.getHello().then((res) => console.log(res));
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
