import React, { useState, useEffect } from 'react';
import AdminOrdersManagement from './AdminOrdersManagement';
import API_URL from '../config/api'; // ⚡ AGREGADO: Import de configuración de API

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('productos');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Panel Administrativo - Supercasa</h1>
                <p className="text-sm text-gray-600">Bienvenido, {user?.nombre}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🛍️ Ver Tienda
              </button>
              <button
                onClick={logout}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-6 space-y-2">
            <button
              onClick={() => setActiveSection('estadisticas')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'estadisticas' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 Dashboard
            </button>
            
            <button
              onClick={() => setActiveSection('productos')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'productos' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📦 Gestionar Productos
            </button>
            
            <button
              onClick={() => setActiveSection('pedidos')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'pedidos' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🚚 Gestión de Entregas
            </button>
            
            <button
              onClick={() => setActiveSection('usuarios')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'usuarios' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👥 Usuarios
            </button>
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1">
          {activeSection === 'estadisticas' && <EstadisticasSection />}
          {activeSection === 'productos' && <ProductosSection />}
          {activeSection === 'pedidos' && <AdminOrdersManagement />}
          {activeSection === 'usuarios' && <UsuariosSection />}
        </main>
      </div>
    </div>
  );
}

// Dashboard con estadísticas
function EstadisticasSection() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      // ✅ CORREGIDO: URL dinámica con template literals correctos
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard de Estadísticas</h2>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPedidos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-900">${stats.ingresosTotales?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsuarios}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Productos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProductos}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Resumen del Negocio</h3>
        <div className="space-y-2">
          <p className="text-gray-600">• Pedidos pendientes: <span className="font-semibold">{stats?.pedidosPendientes || 0}</span></p>
          <p className="text-gray-600">• Promedio por pedido: <span className="font-semibold">${stats?.totalPedidos > 0 ? Math.round(stats.ingresosTotales / stats.totalPedidos).toLocaleString() : 0}</span></p>
          <p className="text-gray-600">• Estado: <span className="text-green-600 font-semibold">✅ Sistema funcionando correctamente</span></p>
        </div>
      </div>
    </div>
  );
}

// Componente para gestionar productos
function ProductosSection() {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      // ✅ CORREGIDO: URL dinámica con template literals correctos
      const response = await fetch(`${API_URL}/productos`);
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestionar Productos ({productos.length})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Agregar Producto'}
        </button>
      </div>

      {showForm && <ProductForm onSuccess={() => { setShowForm(false); fetchProductos(); }} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map(producto => (
          <ProductCard key={producto.id} producto={producto} onUpdate={fetchProductos} />
        ))}
      </div>
    </div>
  );
}

// Componente para usuarios
function UsuariosSection() {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
      // ✅ CORREGIDO: URL dinámica con template literals correctos
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Usuarios ({usuarios.length})</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {usuarios.map(usuario => (
              <tr key={usuario.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {usuario.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {usuario.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    usuario.rol === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(usuario.fecha_registro).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductCard({ producto, onUpdate }) {
  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) return;
    
    try {
      const token = localStorage.getItem('token');
      // ✅ CORREGIDO: URL dinámica en lugar de localhost hardcodeado
      const response = await fetch(`${API_URL}/productos/${producto.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Producto eliminado exitosamente');
        onUpdate();
      } else {
        alert('Error al eliminar producto');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar producto');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {producto.imagen && (
        <img 
          src={producto.imagen} 
          alt={producto.nombre}
          className="w-full h-32 object-cover rounded-lg mb-4"
        />
      )}
      <h3 className="font-bold text-lg mb-2">{producto.nombre}</h3>
      <p className="text-gray-600 text-sm mb-2">{producto.descripcion}</p>
      <p className="text-blue-600 font-bold text-xl mb-2">${producto.precio.toLocaleString()}</p>
      <p className="text-xs text-gray-500 mb-4">Categoría: {producto.categoria}</p>
      
      <button
        onClick={handleDelete}
        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
      >
        🗑️ Eliminar
      </button>
    </div>
  );
}

function ProductForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    categoria: '',
    imagen: '',
    nutricional: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      // ✅ CORREGIDO: URL dinámica con template literals correctos
      const response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Producto agregado exitosamente');
        setFormData({
          nombre: '',
          precio: '',
          descripcion: '',
          categoria: '',
          imagen: '',
          nutricional: ''
        });
        onSuccess();
      } else {
        alert('Error al agregar producto');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar producto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-bold mb-4">Agregar Nuevo Producto</h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Nombre del producto"
          value={formData.nombre}
          onChange={(e) => setFormData({...formData, nombre: e.target.value})}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          required
        />
        
        <input
          type="number"
          placeholder="Precio"
          value={formData.precio}
          onChange={(e) => setFormData({...formData, precio: e.target.value})}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          required
        />
        
        <input
          type="text"
          placeholder="Categoría"
          value={formData.categoria}
          onChange={(e) => setFormData({...formData, categoria: e.target.value})}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          required
        />
        
        <input
          type="url"
          placeholder="URL de la imagen"
          value={formData.imagen}
          onChange={(e) => setFormData({...formData, imagen: e.target.value})}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
        
        <textarea
          placeholder="Descripción"
          value={formData.descripcion}
          onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
          className="border rounded-lg px-3 py-2 col-span-2 focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
        
        <button
          type="submit"
          disabled={isLoading}
          className="col-span-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Agregando...' : 'Agregar Producto'}
        </button>
      </form>
    </div>
  );
}