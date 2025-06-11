import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductForm from './pages/ProductForm';
import Orders from './pages/Orders';  // Asegúrate de que esta importación esté
import Store from './pages/Store';
import AdminLayout from './components/AdminLayout';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/store" element={<Store />} />

        {/* Ruta protegida de administrador con subrutas */}
        <Route path="/dashboard" element={<AdminLayout />}>
          <Route path="productos" element={<Dashboard />} />
          <Route path="add-product" element={<ProductForm />} />
          <Route path="orders" element={<Orders />} /> {/* Ruta para los pedidos */}
        </Route>
      </Routes>
    </Router>
  );
}







