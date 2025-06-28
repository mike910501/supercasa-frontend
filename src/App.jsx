// src/App.jsx
// TU ESTRUCTURA ORIGINAL + PaymentSuccess

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StoreApp from './pages/Store'; // Tu Store.jsx actual (con autenticación)
import AdminDashboard from './pages/AdminDashboard'; // Nuevo dashboard integrado
import ProtectedRoute from './components/ProtectedRoute';
import ToastProvider from './components/ToastProvider';  // ✅ TU TOASTPROVIDER ORIGINAL

// ✅ ÚNICA NUEVA IMPORTACIÓN
import PaymentSuccess from './pages/PaymentSuccess';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ TUS RUTAS ORIGINALES - SIN CAMBIOS */}
        <Route path="/" element={<StoreApp />} />
        <Route path="/store" element={<StoreApp />} />
        
        {/* ✅ ÚNICA RUTA NUEVA - Para éxito del pago */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        
        {/* ✅ TU RUTA ADMIN ORIGINAL - SIN CAMBIOS */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      
      {/* ✅ TU TOASTPROVIDER ORIGINAL - SIN CAMBIOS */}
      <ToastProvider />
    </Router>
  );
}






