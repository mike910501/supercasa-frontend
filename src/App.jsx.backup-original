// src/App.jsx
// TU ESTRUCTURA ORIGINAL + PaymentSuccess + HistorialPedidos

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StoreApp from './pages/Store'; // Tu Store.jsx actual (con autenticación)
import AdminDashboard from './pages/AdminDashboard'; // Nuevo dashboard integrado
import ProtectedRoute from './components/ProtectedRoute';
import ToastProvider from './components/ToastProvider';  // ✅ TU TOASTPROVIDER ORIGINAL

// ✅ IMPORTACIONES
import PaymentSuccess from './pages/PaymentSuccess';
import HistorialPedidos from './components/HistorialPedidos'; // 🎯 NUEVA IMPORTACIÓN

export default function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ TUS RUTAS ORIGINALES - SIN CAMBIOS */}
        <Route path="/" element={<StoreApp />} />
        <Route path="/store" element={<StoreApp />} />
        
        {/* ✅ RUTAS NUEVAS */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/historial" element={<HistorialPedidos />} /> {/* 🎯 NUEVA RUTA */}
        
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






