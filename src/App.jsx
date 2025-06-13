import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StoreApp from './pages/Store'; // Tu Store.jsx actual (con autenticación)
import AdminDashboard from './pages/AdminDashboard'; // Nuevo dashboard integrado
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal - Tienda con autenticación */}
        <Route path="/" element={<StoreApp />} />
        <Route path="/store" element={<StoreApp />} />

        {/* Rutas protegidas de admin */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}







