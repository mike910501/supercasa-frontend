import React from 'react';
import { Link } from 'react-router-dom';
import SupercasaLogo from '../components/SupercasaLogo';

export default function Contacto() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-amber-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <SupercasaLogo 
                size="large"
                showText={true}
                showSlogan={false}
                darkMode={false}
              />
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-amber-600 hover:text-amber-700 font-medium">Inicio</Link>
              <Link to="/quienes-somos" className="text-amber-600 hover:text-amber-700 font-medium">Quiénes Somos</Link>
              <Link to="/app" className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 py-2 rounded-xl hover:from-amber-600 hover:to-yellow-700 font-medium shadow-lg">
                Ingresar a Supercasa
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Contacto
          </h1>
          <p className="text-xl text-amber-600 font-medium">
            Estamos aquí para ayudarte
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-amber-200">
          <h2 className="text-3xl font-bold text-amber-700 mb-8">
            Información de Contacto
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <span className="text-2xl">📱</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">WhatsApp Supercasa</h3>
                <p className="text-gray-700 text-lg"><strong>300 139 9242</strong></p>
                <p className="text-gray-600">Atención inmediata para pedidos y consultas</p>
                <a 
                  href="https://wa.me/573001399242" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Chatear ahora
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <span className="text-2xl">📧</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Email</h3>
                <p className="text-gray-700 text-lg"><strong>contacto@tiendasupercasa.com</strong></p>
                <p className="text-gray-600">Para consultas, sugerencias y soporte</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-amber-100 p-3 rounded-xl">
                <span className="text-2xl">🏗️</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Área de Servicio</h3>
                <p className="text-gray-700"><strong>Conjunto Residencial Torres de Bellavista</strong></p>
                <p className="text-gray-700">Tv 70 d bis a 68 75 sur, Bogotá D.C.</p>
                <p className="text-gray-600 mt-2">Entregas exclusivas en las 5 torres del conjunto</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <span className="text-2xl">🕕</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Horarios de Atención</h3>
                <p className="text-gray-700 text-lg"><strong>6:00 AM - 11:00 PM</strong></p>
                <p className="text-gray-600">Lunes a Domingo - Entregas en máximo 20 minutos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">¿Listo para hacer tu primer pedido?</h3>
          <Link 
            to="/app" 
            className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-8 py-4 rounded-xl hover:from-amber-600 hover:to-yellow-700 font-bold text-lg shadow-xl transform hover:scale-105 transition-all inline-block"
          >
            Ir a Supercasa
          </Link>
        </div>
      </div>
    </div>
  );
}