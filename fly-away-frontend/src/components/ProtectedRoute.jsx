import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  // Le pedimos al cerebro si el usuario está autenticado
  const { token, loading } = useAuth();

  // Mientras loading es true (estamos revisando localStorage), mostramos un "cargando" para evitar parpadeos
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Cargando sesión...</div>;
  }

  // Si NO hay token, redirige al login (reemplaza la URL actual)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, deja pasar al contenido (Outlet renderiza la ruta hija)
  return <Outlet />;
};

export default ProtectedRoute;