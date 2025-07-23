// src/pages/LandingPage.jsx
// LANDING PAGE PÚBLICA PARA WHATSAPP
import React from 'react';
import { Link } from 'react-router-dom';
import SupercasaLogo from '../components/SupercasaLogo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-amber-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <SupercasaLogo 
              size="large"
              showText={true}
              showSlogan={true}
              darkMode={false}
            />
            <nav className="hidden md:flex space-x-6">
              <Link to="/quienes-somos" className="text-amber-600 hover:text-amber-700 font-medium">Quiénes Somos</Link>
              <Link to="/contacto" className="text-amber-600 hover:text-amber-700 font-medium">Contacto</Link>
              <Link to="/app" className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 py-2 rounded-xl hover:from-amber-600 hover:to-yellow-700 font-medium shadow-lg">
                🏗️ Ingresar a Supercasa
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            🏗️ <span className="text-amber-600">Supercasa</span>
          </h1>
          <p className="text-2xl md:text-3xl text-amber-600 mb-8 font-medium">
            "Tu supermercado en casa, en 20 minutos"
          </p>
          <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto">
            Supercasa es tu supermercado virtual especializado en abarrotes para el conjunto residencial <strong>Torres de Bellavista</strong>. 
            Ofrecemos entregas súper rápidas en máximo 20 minutos, directamente a tu torre.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              to="/app" 
              className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-8 py-4 rounded-xl hover:from-amber-600 hover:to-yellow-700 font-bold text-lg shadow-xl transform hover:scale-105 transition-all"
            >
              🛒 Comprar Ahora - 20 min
            </Link>
            <Link 
              to="/quienes-somos" 
              className="border-2 border-amber-500 text-amber-600 px-8 py-4 rounded-xl hover:bg-amber-50 font-bold text-lg transition-all"
            >
              📖 Conoce más sobre nosotros
            </Link>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            ¿Por qué elegir Supercasa?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-amber-50 rounded-2xl border-2 border-amber-200">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-amber-700 mb-3">Entrega Súper Rápida</h3>
              <p className="text-gray-700">Recibe tus abarrotes en máximo 20 minutos directamente en tu torre del conjunto.</p>
            </div>
            
            <div className="text-center p-6 bg-amber-50 rounded-2xl border-2 border-amber-200">
              <div className="text-6xl mb-4">🏗️</div>
              <h3 className="text-xl font-bold text-amber-700 mb-3">Especializado en Torres</h3>
              <p className="text-gray-700">Conocemos perfectamente las 5 torres de Bellavista. Entrega precisa a tu apartamento.</p>
            </div>
            
            <div className="text-center p-6 bg-amber-50 rounded-2xl border-2 border-amber-200">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-amber-700 mb-3">Mejores Precios</h3>
              <p className="text-gray-700">Precios competitivos y promociones exclusivas para los residentes del conjunto.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Productos */}
      <section className="py-16 bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            📦 Nuestros Productos
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-amber-200 text-center">
              <div className="text-4xl mb-3">🥛</div>
              <h4 className="font-bold text-amber-700">Lácteos y Bebidas</h4>
              <p className="text-sm text-gray-600 mt-2">Leche, yogurt, agua, jugos</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-amber-200 text-center">
              <div className="text-4xl mb-3">🍞</div>
              <h4 className="font-bold text-amber-700">Panadería</h4>
              <p className="text-sm text-gray-600 mt-2">Pan fresco, harinas, dulces</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-amber-200 text-center">
              <div className="text-4xl mb-3">🥩</div>
              <h4 className="font-bold text-amber-700">Carnes</h4>
              <p className="text-sm text-gray-600 mt-2">Res, pollo, cerdo, embutidos</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-amber-200 text-center">
              <div className="text-4xl mb-3">🧹</div>
              <h4 className="font-bold text-amber-700">Aseo y Limpieza</h4>
              <p className="text-sm text-gray-600 mt-2">Detergentes, jabones, papel</p>
            </div>
          </div>
        </div>
      </section>

      {/* Horarios y Contacto */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-8">
            📞 Información de Contacto
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-200">
              <h3 className="text-xl font-bold text-amber-700 mb-4">🕕 Horarios</h3>
              <p className="text-gray-700 text-lg"><strong>6:00 AM - 11:00 PM</strong></p>
              <p className="text-gray-600">Todos los días</p>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-200">
              <h3 className="text-xl font-bold text-amber-700 mb-4">📱 Contacto</h3>
              <p className="text-gray-700"><strong>WhatsApp:</strong> 300 139 9242</p>
              <p className="text-gray-700"><strong>Email:</strong> contacto@tiendasupercasa.com</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <SupercasaLogo 
                size="medium"
                showText={true}
                showSlogan={false}
                darkMode={true}
                className="mb-4"
              />
              <p className="text-gray-300">Tu supermercado en casa, en 20 minutos</p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Enlaces</h4>
              <ul className="space-y-2">
                <li><Link to="/quienes-somos" className="text-gray-300 hover:text-amber-400">Quiénes Somos</Link></li>
                <li><Link to="/contacto" className="text-gray-300 hover:text-amber-400">Contacto</Link></li>
                <li><Link to="/app" className="text-gray-300 hover:text-amber-400">Tienda</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/terminos" className="text-gray-300 hover:text-amber-400">Términos y Condiciones</Link></li>
                <li><Link to="/privacidad" className="text-gray-300 hover:text-amber-400">Política de Privacidad</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Ubicación</h4>
              <p className="text-gray-300">Torres de Bellavista</p>
              <p className="text-gray-300">Tv 70 d bis a 68 75 sur</p>
              <p className="text-gray-300">Bogotá, Colombia</p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2024 Supercasa. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}