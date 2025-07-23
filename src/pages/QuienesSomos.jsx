import React from 'react';
import { Link } from 'react-router-dom';
import SupercasaLogo from '../components/SupercasaLogo';

export default function QuienesSomos() {
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
              <Link to="/contacto" className="text-amber-600 hover:text-amber-700 font-medium">Contacto</Link>
              <Link to="/app" className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 py-2 rounded-xl hover:from-amber-600 hover:to-yellow-700 font-medium shadow-lg">
                Ingresar a Supercasa
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Quiénes Somos
          </h1>
          <p className="text-xl text-amber-600 font-medium">
            Conoce la historia de Supercasa
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border-2 border-amber-200">
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              Nuestra Historia
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              <strong>Supercasa</strong> nació de una necesidad real: brindar a los residentes del conjunto 
              residencial <strong>Torres de Bellavista</strong> un servicio de supermercado rápido, 
              confiable y conveniente, directamente en la comodidad de sus hogares.
            </p>
            
            <h2 className="text-3xl font-bold text-amber-700 mb-6 mt-12">
              Nuestra Misión
            </h2>
            <div className="bg-amber-50 p-6 rounded-xl border-l-4 border-amber-500">
              <p className="text-lg text-gray-700">
                Ofrecer el <strong>mejor servicio de supermercado virtual</strong> para el conjunto residencial 
                Torres de Bellavista, garantizando <strong>mejores precios</strong> y <strong>entregas súper rápidas</strong> 
                en máximo 20 minutos.
              </p>
            </div>
          </section>
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/app" 
            className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-8 py-4 rounded-xl hover:from-amber-600 hover:to-yellow-700 font-bold text-lg shadow-xl transform hover:scale-105 transition-all inline-block"
          >
            Prueba Supercasa Ahora
          </Link>
        </div>
      </div>
    </div>
  );
}