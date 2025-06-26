import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StoreApp from './pages/Store'; // Tu Store.jsx actual (con autenticaciÃ³n)
import AdminDashboard from './pages/AdminDashboard'; // Nuevo dashboard integrado
import ProtectedRoute from './components/ProtectedRoute';
import ToastProvider from './components/ToastProvider';  // ← LÍNEA NUEVA

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal - Tienda con autenticaciÃ³n */}
        <Route path="/" element={<StoreApp />} />
        <Route path="/store" element={<StoreApp />} />
        {/* Rutas protegidas de admin */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      <ToastProvider />  {/* ← LÍNEA NUEVA */}
    </Router>
  );
}






