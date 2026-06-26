import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/getErrorMessage';

const RegisterPage = () => {
  // Estado del formulario (corregido)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',   // <--- Cambiado: antes 'nombre'
    lastName: '',    // <--- Cambiado: antes 'apellido'
    password: '',
    // username: ''   // <--- Eliminado: no lo pide la PPT
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, firstName, lastName, password } = formData;
    if (!email || !firstName || !lastName || !password) {
      setError('Todos los campos son obligatorios');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Ingresa un correo electrónico válido');
      return;
    }
    // El backend exige firstName/lastName que empiecen con mayúscula (regex ^[A-Z].+)
    if (!/^[A-Z].+/.test(firstName)) {
      setError('El nombre debe comenzar con una letra mayúscula');
      return;
    }
    if (!/^[A-Z].+/.test(lastName)) {
      setError('El apellido debe comenzar con una letra mayúscula');
      return;
    }
    // El backend exige mínimo 8 caracteres, al menos una mayúscula y un dígito
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('La contraseña debe incluir al menos una letra mayúscula y un número');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // Enviamos los datos con los nombres correctos que espera el backend
      await register({ 
        email, 
        firstName, 
        lastName, 
        password 
      });
      setSuccess(true);
      setLoading(false);
      // Mostramos el mensaje de éxito un instante antes de redirigir al login
      // (antes, la redirección ocurría dentro de register() y el mensaje
      // nunca llegaba a pintarse porque el componente ya se había desmontado).
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setLoading(false);
      setError(getErrorMessage(err, 'Error al registrar usuario. Intenta nuevamente.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear una cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Inicia sesión
            </Link>
          </p>
        </div>

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-700">¡Registro exitoso! Redirigiendo al login...</p>
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
              />
            </div>
            <div>
              <label htmlFor="firstName" className="sr-only">Nombre</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nombre"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="sr-only">Apellido</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Apellido"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña (mín. 8 caracteres, 1 mayúscula y 1 número)"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || success}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;