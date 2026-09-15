import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './AppLayout.jsx';

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <div>Home Page</div>,
      },
    ],
  },
]);
