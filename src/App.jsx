import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <Router>
      <Routes>
        {/* RUTAS PUBLICAS - PARA WHATSAPP */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/terminos" element={<TerminosCondiciones />} />
        <Route path="/privacidad" element={<PoliticaPrivacidad />} />
        
        {/* TU APLICACION ACTUAL */}
        <Route path="/app" element={<StoreApp />} />
        <Route path="/store" element={<StoreApp />} />
        
        {/* RUTAS DE LA APLICACION */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/historial" element={<HistorialPedidos />} />
        
        {/* ADMIN */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      
      <ToastProvider />
    </Router>
  );
}