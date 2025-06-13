// src/config/api.js
// Configuración centralizada de la API

const API_URL = 'https://supercasa-backend-vvu1.onrender.com';

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

// Función helper para hacer requests con manejo de errores
export const apiRequest = async (endpoint, options = {}) => {
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
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
};