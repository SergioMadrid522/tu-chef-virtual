// src/login/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const userId = localStorage.getItem('IdUser');

  if (!userId) {
    // Si no hay IdUser, redirigir a la página de login
    return <Navigate to="/" replace />;
  }

  // Si hay IdUser, renderizar el <Outlet /> (que será MainLayout)
  return <Outlet />;
};

export default ProtectedRoute;