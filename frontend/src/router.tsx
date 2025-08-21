// src/router.tsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import SignUp from './pages/SignUp';

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Home Page</div>,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  {
    path: '/login',
    element: <div>Login Page</div>, // Placeholder
  },
]);

export const AppRouter: React.FC = () => <RouterProvider router={router} />;
