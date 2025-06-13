import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  // Si no hay token, redirigir al login
  if (!token || !user) {
    return <Navigate to="/" />;
  }

  try {
    const userData = JSON.parse(user);
    
    // Si se requiere admin y el usuario no es admin
    if (requireAdmin && userData.rol !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
            <p className="text-gray-600 mb-6">No tienes permisos de administrador para acceder a esta sección.</p>
            <div className="space-x-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🛍️ Ir a la Tienda
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/';
                }}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cambiar Usuario
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  } catch (error) {
    // Si hay error parseando el usuario, limpiar y redirigir
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/" />;
  }
}
