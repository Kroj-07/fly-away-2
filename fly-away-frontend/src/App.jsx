import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Importamos las páginas
import RegisterPage from "./pages/RegisterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SearchFlightsPage from "./pages/SearchFlightsPage.jsx";
import MyBookingsPage from "./pages/MyBookingsPage.jsx";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar global (aparece en todas las páginas) */}
      <Navbar />

      <Routes>
        {/* Rutas PÚBLICAS */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/flights" element={<SearchFlightsPage />} />
        
        {/* Rutas PRIVADAS (protegidas) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/bookings" element={<MyBookingsPage />} />
        </Route>

        {/* Ruta raíz */}
        <Route path="/" element={<SearchFlightsPage />} />
        
        {/* Ruta 404 */}
        <Route path="*" element={
          <div className="text-center text-2xl mt-20">
            <h1>404 - Página no encontrada</h1>
            <p className="text-sm text-gray-500">La ruta que buscas no existe.</p>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;