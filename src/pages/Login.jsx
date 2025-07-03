import React from 'react';
import { useNavigate } from 'react-router-dom';
import SupercasaLogo from '../components/SupercasaLogo';
import '../styles/supercasa-animations.css';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem('isAdmin', 'true'); // Simula que inició sesión como admin
    navigate('/dashboard/productos'); // ✅ Ir directo a la sección de productos
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        
        {/* Logo y Branding */}
        <div className="text-center mb-8">
          <SupercasaLogo 
            size="large"
            showText={true}
            showSlogan={true}
            darkMode={true}
            className="justify-center mb-6"
          />
          <h2 className="text-xl font-bold text-gray-200 mb-2">Panel Administrativo</h2>
          <p className="text-gray-400">Acceso para administradores</p>
        </div>

        {/* Información del sistema */}
        <div className="bg-gray-700 border border-gray-600 rounded-xl p-4 mb-6">
          <div className="flex items-center mb-3">
            <div className="bg-amber-500 text-amber-900 p-2 rounded-lg mr-3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h3 className="text-gray-200 font-semibold">Sistema de Gestión</h3>
              <p className="text-gray-400 text-sm">Las 5 Torres del Conjunto</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✅</span>
              <span>Gestión de inventario en tiempo real</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✅</span>
              <span>Control de entregas por torre</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✅</span>
              <span>Panel administrativo avanzado</span>
            </div>
          </div>
        </div>

        {/* Botón de acceso */}
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 px-6 py-4 rounded-xl font-bold hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            <span>Acceder al Panel Administrativo</span>
          </div>
        </button>

        {/* Link de regreso */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-amber-400 hover:text-amber-300 text-sm transition-colors duration-300"
          >
            ← Volver a la tienda
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-500 text-xs">
            🏢 Supercasa - Sistema Administrativo
          </p>
          <p className="text-gray-600 text-xs mt-1">
            Conjunto Residencial • Torres 1-5
          </p>
        </div>
      </div>
    </div>
  );
}

