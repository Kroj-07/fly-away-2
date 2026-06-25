import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  // Obtenemos el estado y las funciones del contexto
  const { user, token, logout } = useAuth();
  const isAuthenticated = !!token;
  const navigate = useNavigate();

  // Manejador de logout (lo implementaremos en el Paso 7.2)
  const handleLogout = () => {
    logout(); // Llama a la función del contexto
    navigate('/login'); // Redirige al login
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Marca */}
          <Link to="/flights" className="flex items-center space-x-2">
            <span className="text-white text-2xl font-bold">✈️ Fly Away</span>
          </Link>

          {/* Enlaces de navegación (derecha) */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              // ---- USUARIO AUTENTICADO ----
              <>
                {/* Mostrar nombre del usuario si existe */}
                {user && (
                  <span className="text-white font-medium">
                    👋 Hola, {user.nombre || user.name || 'Usuario'}
                  </span>
                )}
                
                {/* Enlace a Búsqueda */}
                <Link 
                  to="/flights" 
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Buscar Vuelos
                </Link>
                
                {/* Enlace a Mis Reservas */}
                <Link 
                  to="/bookings" 
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Mis Reservas
                </Link>
                
                {/* Botón de Cerrar Sesión */}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              // ---- USUARIO NO AUTENTICADO ----
              <>
                {/* Enlace a Registro */}
                <Link 
                  to="/register" 
                  className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Registrarse
                </Link>
                
                {/* Enlace a Login */}
                <Link 
                  to="/login" 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Iniciar Sesión
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;