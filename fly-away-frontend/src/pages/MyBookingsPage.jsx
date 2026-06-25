import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const MyBookingsPage = () => {
  // Estados para manejar las reservas
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Obtenemos el token para verificar autenticación (aunque ProtectedRoute ya lo hace)
  const { token } = useAuth();
  const isAuthenticated = !!token;

  // useEffect para cargar las reservas al montar el componente
  useEffect(() => {
  // Si no está autenticado, no hacemos nada
  if (!isAuthenticated) {
    setLoading(false);
    return;
  }

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Leer los IDs guardados en localStorage
      const storedIds = JSON.parse(localStorage.getItem('myBookings') || '[]');
      
      // 2. Si no hay IDs, mostramos mensaje de vacío
      if (storedIds.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }

      // 3. Hacer una petición GET por cada ID (en paralelo con Promise.all)
      const promises = storedIds.map((id) =>
        axiosClient.get(`/flights/book/${id}`)
      );
      
      const responses = await Promise.all(promises);
      
      // 4. Extraer los datos de cada respuesta
      const bookingsData = responses.map((response) => response.data);
      
      // 5. Guardar los datos en el estado
      setBookings(bookingsData);
      setLoading(false);
      
    } catch (err) {
        setLoading(false);
        
        // Si el error es 404 (No encontrado), filtramos ese ID del localStorage
        if (err.response && err.response.status === 404) {
            // Intentamos extraer el ID de la URL
            const url = err.config.url; // ej: "/flights/book/123"
            const failedId = url.split('/').pop(); // extraemos "123"
            
            // Filtramos el ID fallido de localStorage
            const currentIds = JSON.parse(localStorage.getItem('myBookings') || '[]');
            const updatedIds = currentIds.filter(id => id !== failedId);
            localStorage.setItem('myBookings', JSON.stringify(updatedIds));
            
            // Recargamos la lista (llamamos recursivamente o simplemente recargamos la página)
            // Para simplificar, mostramos un mensaje y sugerimos recargar.
            setError(`La reserva con ID ${failedId} ya no existe. Se ha eliminado de tu lista. Recarga la página.`);
        } else if (err.response && err.response.data && err.response.data.message) {
            setError(err.response.data.message);
        } else {
            setError('Error al cargar tus reservas. Intenta nuevamente.');
        }
        
        setBookings([]);
        }
  };

  fetchBookings();
}, [isAuthenticated]);

  // Renderizado principal
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📋 Mis Reservas</h1>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Estado de carga */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Cargando tus reservas...</p>
        </div>
      )}

      {/* Lista de reservas (la implementaremos en el Paso 6.3) */}
      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">✈️ No tienes reservas aún.</p>
              <p className="text-gray-400 text-sm mt-1">¡Viaja con Fly Away y reserva tu próximo destino!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {/* Aquí iremos mapeando las reservas en el Paso 6.3 */}
              {bookings.map((booking) => (
                <div key={booking.id} className="p-6">
                  <p className="text-gray-500">Reserva ID: {booking.id}</p>
                  {bookings.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">✈️ No tienes reservas aún.</p>
                        <p className="text-gray-400 text-sm mt-1">¡Viaja con Fly Away y reserva tu próximo destino!</p>
                    </div>
                    ) : (
                    <div className="divide-y divide-gray-200">
                        {bookings.map((booking) => (
                        <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-gray-800">
                                    {booking.flightNumber || 'N/A'}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                    {booking.airline || 'Sin aerolínea'}
                                </span>
                                </div>
                                <div className="mt-1 text-sm text-gray-500">
                                <span>📅 Salida: {booking.departure ? new Date(booking.departure).toLocaleString() : 'No disponible'}</span>
                                </div>
                            </div>
                            <div className="mt-2 md:mt-0">
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                Confirmada
                                </span>
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;