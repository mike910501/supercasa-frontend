import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StoreApp from './pages/Store';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ToastProvider from './components/ToastProvider';
import PaymentSuccess from './pages/PaymentSuccess';
import HistorialPedidos from './components/HistorialPedidos';

// PAGINAS PUBLICAS PARA WHATSAPP
import LandingPage from './pages/LandingPage';
import QuienesSomos from './pages/QuienesSomos';
import Contacto from './pages/Contacto';
import TerminosCondiciones from './pages/TerminosCondiciones';
import PoliticaPrivacidad from './pages/PoliticaPrivacidad';

// Componente 404 simple
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-amber-600 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">Página no encontrada</p>
      <a 
        href="/" 
        className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors"
      >
        Volver al inicio
      </a>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ========== RUTA PRINCIPAL - DIRECTO A LA TIENDA ========== */}
        <Route path="/" element={<StoreApp />} />
        
        {/* ========== RUTAS PUBLICAS - SOLO PARA WHATSAPP/SEO ========== */}
        <Route path="/inicio" element={<LandingPage />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/terminos" element={<TerminosCondiciones />} />
        <Route path="/privacidad" element={<PoliticaPrivacidad />} />
        
        {/* ========== APLICACION PRINCIPAL ========== */}
        <Route path="/app" element={<StoreApp />} />
        
        {/* Redirect para compatibilidad - /store redirige a /app */}
        <Route path="/store" element={<Navigate to="/app" replace />} />
        
        {/* ========== FUNCIONALIDADES DE LA APP ========== */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/historial" element={<HistorialPedidos />} />
        
        {/* ========== PANEL ADMINISTRATIVO ========== */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* ========== RUTAS DE FALLBACK ========== */}
        {/* Redirect amigable para URLs comunes */}
        <Route path="/tienda" element={<Navigate to="/app" replace />} />
        <Route path="/supermercado" element={<Navigate to="/app" replace />} />
        <Route path="/productos" element={<Navigate to="/app" replace />} />
        
        {/* 404 - Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <ToastProvider />
    </Router>
  );
}