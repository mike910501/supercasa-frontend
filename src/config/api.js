import { handleAuthError } from '../utils/authHandler';

//const API_URL = 'https://supercasa-backend-vvu1.onrender.com';
const API_URL = 'http://localhost:3000';
export default API_URL;

// También puedes exportar endpoints específicos si quieres
export const ENDPOINTS = {
  // Autenticación
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  PROFILE: `${API_URL}/auth/profile`,
  // Productos
  PRODUCTOS: `${API_URL}/productos`,
  // Pedidos
  ORDERS: `${API_URL}/orders`,
  // Admin
  ADMIN_PEDIDOS: `${API_URL}/api/admin/pedidos`,
  ADMIN_STATS: `${API_URL}/admin/stats`,
  ADMIN_USERS: `${API_URL}/admin/users`
};

// Función helper MEJORADA para hacer requests con manejo de errores
export const apiRequest = async (endpoint, options = {}, navigate = null) => {
  try {
    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // NUEVO: Manejar errores de autenticación automáticamente
    // NUEVO: Manejar errores de autenticación automáticamente  
if (response.status === 401 || response.status === 403) {
      const authError = {
        response: { status: 401 },
        message: 'Token expirado o inválido'
      };
      
      if (handleAuthError(authError, navigate)) {
        throw new Error('Sesión expirada');
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    
    // NUEVO: Verificar si es error de conexión (backend dormido)
    if (error.message.includes('fetch')) {
      throw new Error('Conectando con el servidor... Por favor espere unos segundos.');
    }
    
    throw error;
  }
};

// NUEVOS: Métodos simplificados para cada tipo de request
export const api = {
  // GET request
  get: (endpoint, navigate = null) => {
    return apiRequest(endpoint, { method: 'GET' }, navigate);
  },
  
  // POST request
  post: (endpoint, data, navigate = null) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    }, navigate);
  },
  
  // PUT request
  put: (endpoint, data, navigate = null) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    }, navigate);
  },
  
  // DELETE request
  delete: (endpoint, navigate = null) => {
    return apiRequest(endpoint, { method: 'DELETE' }, navigate);
  },
  
  // PATCH request
  patch: (endpoint, data, navigate = null) => {
    return apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }, navigate);
  }
};