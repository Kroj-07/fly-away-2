import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const SearchFlightsPage = () => {
  // Estado para los filtros de búsqueda
  const [filters, setFilters] = useState({
    flightNumber: '',
    airline: '',
    departureFrom: '',
    departureTo: '',
  });

  // Estado para los resultados y UI
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searched, setSearched] = useState(false); // Para saber si ya se hizo una búsqueda
  const [bookingLoading, setBookingLoading] = useState(null); // guarda el flightId que se está reservando

  // Obtenemos el token para saber si el usuario está autenticado
  const { token } = useAuth();
  const isAuthenticated = !!token;

  // Manejador de cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // ---- FUNCIÓN DE BÚSQUEDA ----
  const handleSearch = async (e) => {
    e.preventDefault();

    // Si ambos campos están vacíos, mostramos un error o simplemente buscamos todo
    // La PPT dice "Inputs: número de vuelo y/o nombre de aerolínea" (opcionales)
    // Así que permitimos búsqueda sin filtros (traerá todos los vuelos)
    
    setLoading(true);
    setError('');
    setSuccessMessage(''); // <--- CORRECCIÓN: Limpiamos mensajes de éxito al buscar nuevamente
    setSearched(true);

    try {
      // Construimos los query params
      const params = {};
      if (filters.flightNumber.trim()) params.flightNumber = filters.flightNumber.trim();
      if (filters.airline.trim()) params.airlineName = filters.airline.trim(); // <--- CORREGIDO
      // --- CORRECCIÓN: Formatear fechas a ISO-8601 completo ---
    if (filters.departureFrom) {
      params.estDepartureTimeFrom = filters.departureFrom + 'T00:00:00Z';
    }
    if (filters.departureTo) {
      params.estDepartureTimeTo = filters.departureTo + 'T23:59:59Z'; // Para incluir todo el día
    }
      // Hacemos la petición GET (pública, sin token necesario)
      const response = await axiosClient.get('/flights/search', { params });
      
      // Guardamos los resultados
      setFlights(response.data.items || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      // Manejo de errores
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al buscar vuelos. Intenta nuevamente.');
      }
      setFlights([]);
    }
  };

  // ---- FUNCIÓN PARA OBTENER DETALLE DE RESERVA (NICE TO HAVE) ----
  const fetchBookingDetail = async (bookingId) => {
    try {
      const response = await axiosClient.get(`/flights/book/${bookingId}`);
      return response.data;
    } catch (err) {
      console.error('Error al obtener detalle de reserva:', err);
      throw err;
    }
  };

  // ---- FUNCIÓN PARA RESERVAR UN VUELO (LA JOYA DE LA CORONA) ----
  const handleBook = async (flightId) => {
    // Verificación extra de seguridad (aunque el botón ya esté deshabilitado)
    if (!isAuthenticated) {
      setError('Debes iniciar sesión para reservar un vuelo.');
      return;
    }

    // Evitar múltiples clics en el mismo vuelo
    if (bookingLoading === flightId) return;

    setBookingLoading(flightId); // Marcar este vuelo como "cargando"
    setError(''); // Limpiar errores anteriores
    setSuccessMessage(''); // Limpiar mensajes de éxito anteriores

    try {
      // 1. Hacemos la petición POST al endpoint protegido
      // El interceptor de Axios agregará automáticamente el token
      const response = await axiosClient.post('/flights/book', { flightId });
      
      // 2. Extraemos el bookingId de la respuesta (asumimos que viene en response.data.bookingId)
      const bookingId = response.data.id;    
      // 3. Guardamos el bookingId en localStorage (para "Mis Reservas")
      const currentBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
      const updatedBookings = [...currentBookings, bookingId];
      localStorage.setItem('myBookings', JSON.stringify(updatedBookings));
      
      // 4. Mostramos mensaje de éxito
      setSuccessMessage(`✅ ¡Reserva creada! ID: ${bookingId}`);
      
      // 5. Opcional: podríamos actualizar la lista de vuelos para reflejar asientos disponibles,
      // pero eso sería otra llamada al backend. Por ahora, solo mostramos el éxito.
      
    } catch (err) {
      // ---- MANEJO DE ERRORES DEL BACKEND (PPT: "Mostrar errores del backend") ----
      let errorMessage = 'Error al reservar el vuelo. Intenta nuevamente.';
      
      if (err.response && err.response.data) {
        // Si el backend devuelve un mensaje directo
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } 
        // Si devuelve un objeto con múltiples errores
        else if (typeof err.response.data === 'object') {
          const messages = Object.values(err.response.data).flat();
          errorMessage = messages.join(' ');
        }
      }
      
      setError(errorMessage);
      
      // Si el error es 401 (no autorizado), el interceptor ya redirigirá al login,
      // pero mostramos el mensaje por si acaso.
      if (err.response && err.response.status === 401) {
        setError('Tu sesión ha expirado. Inicia sesión nuevamente.');
      }
    } finally {
      // Siempre liberamos el estado de carga, haya éxito o error
      setBookingLoading(null);
    }
    // <--- CORRECCIÓN: Eliminado el JSX suelto que estaba aquí (causaba error de sintaxis).
    // El mensaje de éxito se renderiza en el return principal usando {successMessage && ...}
  };

  // ---- RENDERIZADO PRINCIPAL ----
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">✈️ Búsqueda de Vuelos</h1>

      {/* Formulario de búsqueda */}
      <form onSubmit={handleSearch} className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Vuelo
            </label>
            <input
              id="flightNumber"
              name="flightNumber"
              type="text"
              value={filters.flightNumber}
              onChange={handleChange}
              placeholder="Ej: AA123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="departureFrom" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de salida (desde)
            </label>
            <input
                id="departureFrom"
                name="departureFrom"
                type="date"
                value={filters.departureFrom}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="departureTo" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de salida (hasta)
            </label>
            <input
                id="departureTo"
                name="departureTo"
                type="date"
                value={filters.departureTo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="airline" className="block text-sm font-medium text-gray-700 mb-1">
              Aerolínea
            </label>
            <input
              id="airline"
              name="airline"
              type="text"
              value={filters.airline}
              onChange={handleChange}
              placeholder="Ej: Latam"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Buscando...' : 'Buscar Vuelos'}
          </button>
        </div>
      </form>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Resultados */}
      {searched && !loading && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {flights.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">✈️ No se encontraron vuelos con esos criterios.</p>
              <p className="text-gray-400 text-sm mt-1">Prueba con otros filtros.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aerolínea</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salida</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Llegada</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asientos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(flights) && flights.map((flight) => (
                    <tr key={flight.id || flight.flightNumber}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{flight.flightNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{flight.airline}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{flight.departure}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{flight.arrival}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{flight.seats}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                            disabled={!isAuthenticated || bookingLoading === flight.id}
                            className={`px-4 py-1 rounded-md text-white font-medium ${
                                !isAuthenticated
                                ? 'bg-gray-400 cursor-not-allowed'
                                : bookingLoading === flight.id
                                ? 'bg-yellow-500 cursor-wait'
                                : 'bg-green-600 hover:bg-green-700 cursor-pointer'
                            }`}
                            onClick={() => handleBook(flight.id)}
                            >
                            {!isAuthenticated 
                                ? 'Inicia sesión' 
                                : bookingLoading === flight.id 
                                ? 'Reservando...' 
                                : 'Reservar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFlightsPage;