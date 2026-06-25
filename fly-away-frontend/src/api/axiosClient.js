import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api',  // <--- La dirección de nuestro backend
  headers: {
    'Content-Type': 'application/json',   // Le decimos al backend: "Te voy a enviar datos en formato JSON"
  },
});

export default axiosClient;


// ---- Interceptor de Petición (El que pone el pase VIP) ----
axiosClient.interceptors.request.use(
  (config) => {
    // 1. Intentamos robar el token del localStorage
    const token = localStorage.getItem('token');
    
    // 2. Si existe el token, lo pegamos en el header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 3. Devolvemos la configuración modificada para que la petición salga
    return config;
  },
  (error) => {
    // Si hay un error antes de enviar (raro), lo rechazamos
    return Promise.reject(error);
  }
);

// ---- Interceptor de Respuesta (El que vigila los peligros) ----
axiosClient.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa (2xx), la dejamos pasar sin tocarla
    return response;
  },
  (error) => {
    // Si la respuesta es un error...
    // 1. Verificamos si es un error 401 (No autorizado)
    if (error.response && error.response.status === 401) {
      // 2. Limpiamos el localStorage (borramos el token falso o expirado)
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // Si guardamos user, también lo borramos
      
      // 3. Redirigimos al login usando window.location (o navigate si estamos en un componente)
      // Usamos window.location porque es el método más seguro en interceptores (fuera del contexto de React)
      window.location.href = '/login';
    }
    
    // 4. Si es otro tipo de error (400, 404, 500), lo lanzamos para que el componente que llamó a la API lo maneje.
    return Promise.reject(error);
  }
);