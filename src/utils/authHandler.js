// src/utils/authHandler.js
// Manejo elegante de autenticación y tokens expirados para Supercasa

import { toast } from 'react-hot-toast';

/**
 * Maneja errores de autenticación de forma elegante
 * Preserva el carrito y proporciona feedback claro al usuario
 */
export const handleAuthError = (error, navigate = null) => {
  console.log('🚨 handleAuthError ejecutándose...', { error, navigate: !!navigate });
  console.log('🔍 Error status:', error?.response?.status);
  console.log('🔍 Error message:', error?.message);
  
  if (error?.response?.status === 401 || error?.response?.status === 403 || error?.message?.includes('token')) {
    console.log('✅ Condición de auth error cumplida, procesando...');
    
    // 1. Preservar carrito actual antes de logout
    const carritoActual = localStorage.getItem('carrito');
    if (carritoActual && carritoActual !== '[]') {
      localStorage.setItem('carrito-temp', carritoActual);
      console.log('🛒 Carrito preservado durante logout automático');
    }
    
    // 2. Limpiar datos de autenticación
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🧹 Datos de auth limpiados');
    
    // 3. Mostrar mensaje profesional y claro
    toast.error(
      "Su sesión ha expirado por seguridad. Iniciando sesión nuevamente...", 
      {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: '500',
          borderRadius: '8px',
          padding: '12px 16px'
        },
        icon: '🔒'
      }
    );
    console.log('📱 Toast de sesión expirada mostrado');
    
    // 4. Redireccionar después de mostrar el mensaje
    console.log('🔄 Preparando redirección...', { navigate: !!navigate });
    setTimeout(() => {
      console.log('🚀 Ejecutando redirección automática...');
      try {
        if (navigate) {
          console.log('📍 Usando navigate() para redireccionar');
          navigate('/');
        } else {
          console.log('📍 Usando window.location para redireccionar');
          window.location.href = '/';
        }
      } catch (error) {
        console.error('❌ Error en redirección:', error);
        console.log('🔄 Intentando redirección con window.location.replace');
        window.location.replace('/');
      }
    }, 2000);
    
    return true; // Indica que se manejó un error de auth
  }
  
  console.log('❌ No era un error de auth, continuando...');
  return false; // No era un error de auth
};

/**
 * Restaura el carrito después de re-login exitoso
 */
export const restoreCartAfterLogin = () => {
  const carritoTemp = localStorage.getItem('carrito-temp');
  
  if (carritoTemp) {
    localStorage.setItem('carrito', carritoTemp);
    localStorage.removeItem('carrito-temp');
    
    const items = JSON.parse(carritoTemp);
    const cantidadItems = items.reduce((total, item) => total + item.cantidad, 0);
    
    toast.success(
      `¡Bienvenido de nuevo! Se restauró su carrito (${cantidadItems} productos)`, 
      {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#10b981',
          color: '#fff',
          fontWeight: '500',
          borderRadius: '8px'
        },
        icon: '🛒'
      }
    );
    
    return items;
  }
  
  return null;
};

/**
 * Verifica si hay un carrito temporal para restaurar
 */
export const hasTemporaryCart = () => {
  const carritoTemp = localStorage.getItem('carrito-temp');
  return carritoTemp && carritoTemp !== '[]';
};

/**
 * Interceptor de fetch personalizado para manejar errores de auth automáticamente
 */
export const authFetch = async (url, options = {}, navigate = null) => {
  try {
    // Agregar token automáticamente si existe
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Si hay error 401, manejar automáticamente
    if (response.status === 401) {
      const authError = {
        response: { status: 401 },
        message: 'Token expirado'
      };
      handleAuthError(authError, navigate);
      throw new Error('Sesión expirada');
    }
    
    return response;
    
  } catch (error) {
    // Manejar otros errores de autenticación
    if (error.message.includes('token') || error.message.includes('auth')) {
      handleAuthError(error, navigate);
    }
    throw error;
  }
};

/**
 * Hook personalizado para manejar autenticación en componentes
 */
export const useAuthHandler = (navigate) => {
  const handleError = (error) => {
    return handleAuthError(error, navigate);
  };
  
  const secureRequest = async (url, options = {}) => {
    return authFetch(url, options, navigate);
  };
  
  return {
    handleError,
    secureRequest,
    restoreCart: restoreCartAfterLogin,
    hasTemporaryCart
  };
};