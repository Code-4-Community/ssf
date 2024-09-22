import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import apiClient from '@api/apiClient';
import Root from '@containers/root';
import NotFound from '@containers/404';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <NotFound />,
  },
]);

export const App: React.FC = () => {
  useEffect(() => {
    apiClient.getHello().then((res) => console.log(res));
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
