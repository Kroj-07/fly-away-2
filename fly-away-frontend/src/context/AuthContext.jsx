import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

// 1. Creamos el Contexto (el contenedor vacío)
const AuthContext = createContext();

// 2. Creamos el Provider (el que tiene los datos y los comparte)
export const AuthProvider = ({ children }) => {
  // Estado local del cerebro
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Para saber si ya cargó la sesión guardada
  const navigate = useNavigate();

  // ---- Función para REHIDRATAR (recuperar sesión al recargar la página) ----
  useEffect(() => {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (storedToken) {
    setToken(storedToken);
    // Si tenemos el usuario guardado, lo usamos; si no, lo obtenemos del backend
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Si no hay usuario guardado, lo obtenemos del backend
      fetchCurrentUser().catch(() => {
        // Si falla, el token podría ser inválido, lo limpiamos
        localStorage.removeItem('token');
        setToken(null);
        });
      }
    }
    setLoading(false);
  }, []);

  // ---- Función de LOGIN (la más importante) ----
  const login = async (email, password) => {
  try {
    // 1. Login - obtener token
    const response = await axiosClient.post('/auth/login', { email, password });
    const { token: newToken } = response.data;
    
    // Guardamos token
    localStorage.setItem('token', newToken);
    setToken(newToken);
    
    // 2. Obtener perfil del usuario (NICE TO HAVE)
    const userResponse = await axiosClient.get('/users/current');
    const userData = userResponse.data;
    
    // Guardamos usuario
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    
    navigate('/flights');
    return { success: true };
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    throw error;
  }
};

  // ---- Función de REGISTRO (no guarda token, solo crea el usuario) ----
  const register = async (userData) => {
    try {
      const payload = {
      ...userData,
      username: userData.email // <--- Si no viene username, usamos email
    };
    await axiosClient.post('/users/register', payload);
      // Redirigimos al login (página 4: "Mostrar mensaje de éxito y redirigir al login")
      navigate('/login');
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // ---- Función de LOGOUT (limpiar todo) ----
  const logout = () => {
    // Limpiamos localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Limpiamos el estado del cerebro
    setToken(null);
    setUser(null);
    
    // Redirigimos al login
    navigate('/login');
  };

  // ---- Función para obtener el perfil del usuario (Nice to Have de la página 5) ----
  const fetchCurrentUser = async () => {
    try {
      const response = await axiosClient.get('/users/current');
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
      throw error;
    }
  };

  // El valor que estará disponible para todos los componentes
  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    fetchCurrentUser,
    isAuthenticated: !!token, // true si hay token, false si no
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ---- Custom Hook para usar el contexto fácilmente (Buenísima práctica) ----
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};