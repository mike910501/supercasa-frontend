import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6 space-y-4">
        <h2 className="text-xl font-bold mb-6">🔧 Panel Admin</h2>
        <nav className="space-y-2">
          <Link to="/dashboard/productos" className="block hover:underline">📦 Productos</Link>
          <Link to="/dashboard/add-product" className="block hover:underline">➕ Agregar producto</Link>
          <Link to="/dashboard/orders" className="block hover:underline">Pedidos</Link> {/* Ruta de pedidos */}
          <Link to="/store" className="block hover:underline">🛍️ Ir a tienda</Link>
        </nav>
      </aside>

      {/* Área principal */}
      <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
        <Outlet />  {/* Aquí se renderizan las subrutas como los pedidos */}
      </main>
    </div>
  );
}



