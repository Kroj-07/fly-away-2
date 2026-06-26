import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { getErrorMessage } from '../utils/getErrorMessage';

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

        // 3. Hacer una petición GET por cada ID (en paralelo, sin cortar todo si una falla)
        const results = await Promise.allSettled(
          storedIds.map((id) => axiosClient.get(`/flights/book/${id}`))
        );

        const validBookings = [];
        const idsToRemove = [];

        results.forEach((result, index) => {
          const id = storedIds[index];
          if (result.status === 'fulfilled') {
            validBookings.push(result.value.data);
          } else {
            // Si una reserva específica ya no existe (404), la limpiamos de localStorage
            // sin que eso rompa la carga del resto de reservas válidas.
            idsToRemove.push(id);
          }
        });

        if (idsToRemove.length > 0) {
          const remainingIds = storedIds.filter((id) => !idsToRemove.includes(id));
          localStorage.setItem('myBookings', JSON.stringify(remainingIds));
        }

        // 4. GetBookingDTO no incluye el nombre de la aerolínea, así que lo
        //    completamos consultando GET /flights/{flightId} (endpoint público).
        const enriched = await Promise.all(
          validBookings.map(async (booking) => {
            try {
              const flightResponse = await axiosClient.get(`/flights/${booking.flightId}`);
              return { ...booking, airlineName: flightResponse.data.airlineName };
            } catch {
              // Si no se puede obtener el vuelo asociado, mostramos la reserva sin aerolínea
              return { ...booking, airlineName: null };
            }
          })
        );

        setBookings(enriched);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(getErrorMessage(err, 'Error al cargar tus reservas. Intenta nuevamente.'));
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

      {/* Lista de reservas */}
      {!loading && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                          {booking.airlineName || 'Sin aerolínea'}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <span>
                          📅 Salida: {booking.estDepartureTime ? new Date(booking.estDepartureTime).toLocaleString() : 'No disponible'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Reserva ID: {booking.id}</div>
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
      )}
    </div>
  );
};

export default MyBookingsPage;
