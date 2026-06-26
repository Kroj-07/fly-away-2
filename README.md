# ✈️ Fly Away - Frontend

Frontend para el sistema de reserva de vuelos Fly Away, desarrollado como parte del curso CS2031 (Desarrollo Basado en Plataformas).

## 🚀 Tecnologías

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios

## 📦 Instalación y ejecución

```bash
# Clonar el repositorio
git clone https://github.com/Kroj-07/fly-away-frontend.git
cd fly-away-frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

> El backend debe estar corriendo en `http://localhost:8080`. El frontend utiliza un proxy en Vite para evitar problemas de CORS.

## ✅ Funcionalidades implementadas

### Must Have (+0.6 pts)
- **Registro de usuarios** (`/register`) – Validación de campos vacíos y errores del backend.
- **Inicio de sesión** (`/login`) – Guarda el token JWT en `localStorage` y redirige a la búsqueda.
- **Búsqueda de vuelos** (`/flights`) – Filtros por número de vuelo y aerolínea. Manejo de resultados vacíos.
- **Reserva de vuelos** – Botón habilitado solo para usuarios autenticados. Mensaje de éxito con ID de reserva y manejo de errores (vuelo pasado / horario superpuesto).
- **Cerrar sesión y navegación** – Limpia el token, rutas protegidas y navegación clara entre pantallas.

### Nice to Have (+0.4 pts)
- **Mostrar nombre del usuario** – Obtenido mediante `GET /users/current` después del login.
- **Filtro por rango de fechas** – En la búsqueda de vuelos.
- **Mis Reservas** (`/bookings`) – Lista de reservas del usuario, guardando los IDs en `localStorage` y consumiendo `GET /flights/book/{id}`.

## 📁 Estructura del proyecto

```
src/
├── api/           # Cliente Axios con interceptores
├── context/       # AuthContext (estado global de autenticación)
├── pages/         # Register, Login, SearchFlights, MyBookings
├── components/    # Navbar, ProtectedRoute
└── App.jsx        # Enrutamiento principal
```

## 📝 Notas

- El token JWT se almacena en `localStorage`.
- Las rutas privadas (`/bookings`) están protegidas y redirigen al login si no hay sesión activa.
- La aplicación utiliza Tailwind CSS para los estilos.
