import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem('isAdmin', 'true'); // Simula que inició sesión como admin
    navigate('/dashboard/productos'); // ✅ Ir directo a la sección de productos
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
      >
        Iniciar sesión como administrador
      </button>
    </div>
  );
}

