import React, { useState, useEffect } from 'react';
import AdminOrdersManagement from './AdminOrdersManagement';
import API_URL from '../config/api';

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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-xl border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-200">Panel Administrativo - Supercasa</h1>
                <p className="text-sm text-gray-400">Bienvenido, {user?.nombre}</p>
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
        <aside className="w-64 bg-gray-800 shadow-xl min-h-screen border-r border-gray-700">
          <nav className="p-6 space-y-2">
            <button
              onClick={() => setActiveSection('estadisticas')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'estadisticas'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              📊 Dashboard
            </button>

            <button
              onClick={() => setActiveSection('productos')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'productos'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              📦 Control de Inventario
            </button>

            <button
              onClick={() => setActiveSection('pedidos')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'pedidos'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-gray-200'
              }`}
            >
              🚚 Gestión de Entregas
            </button>

            <button
              onClick={() => setActiveSection('usuarios')}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === 'usuarios' 
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-gray-200'
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
      <div className="p-6 bg-gray-900 min-h-screen">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-200 mb-6">Dashboard de Estadísticas</h2>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6">
            <div className="flex items-center">
              <div className="bg-blue-900 p-3 rounded-full">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-200">{stats.totalPedidos}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6">
            <div className="flex items-center">
              <div className="bg-green-900 p-3 rounded-full">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Ingresos Totales</p>
                <p className="text-2xl font-bold text-gray-200">${stats.ingresosTotales?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6">
            <div className="flex items-center">
              <div className="bg-purple-900 p-3 rounded-full">
                <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-200">{stats.totalUsuarios}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6">
            <div className="flex items-center">
              <div className="bg-yellow-900 p-3 rounded-full">
                <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Productos</p>
                <p className="text-2xl font-bold text-gray-200">{stats.totalProductos}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6">
        <h3 className="text-lg font-bold text-gray-200 mb-4">Resumen del Negocio</h3>
        <div className="space-y-2">
          <p className="text-gray-300">• Pedidos pendientes: <span className="font-semibold text-yellow-400">{stats?.pedidosPendientes || 0}</span></p>
          <p className="text-gray-300">• Promedio por pedido: <span className="font-semibold text-blue-400">${stats?.totalPedidos > 0 ? Math.round(stats.ingresosTotales / stats.totalPedidos).toLocaleString() : 0}</span></p>
          <p className="text-gray-300">• Estado: <span className="text-green-400 font-semibold">✅ Sistema funcionando correctamente</span></p>    
        </div>
      </div>
    </div>
  );
}

// Componente de productos en modo oscuro con filtros
function ProductosSection() {
  const [productos, setProductos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: 'todas',
    estado: 'todos',
    ordenarPor: 'nombre_asc'
  });

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await fetch(`${API_URL}/productos`);
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generar código automático
  const generarCodigo = () => {
    const maxCodigo = productos.reduce((max, p) => {
      if (p.codigo && p.codigo.startsWith('SC-')) {
        const num = parseInt(p.codigo.split('-')[1]);
        return Math.max(max, num);
      }
      return max;
    }, 0);
    return `SC-${String(maxCodigo + 1).padStart(4, '0')}`;
  };

  // Obtener categorías únicas
  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];

  // Filtrar productos
  const productosFiltrados = productos
    .filter(producto => {
      const matchesBusqueda = producto.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                             producto.codigo?.toLowerCase().includes(filtros.busqueda.toLowerCase());
      
      const matchesCategoria = filtros.categoria === 'todas' || producto.categoria === filtros.categoria;
      
      const stock = producto.stock || 0;
      const matchesEstado = filtros.estado === 'todos' ||
                           (filtros.estado === 'sin_stock' && stock === 0) ||
                           (filtros.estado === 'stock_bajo' && stock > 0 && stock <= 5) ||
                           (filtros.estado === 'en_stock' && stock > 5);
      
      return matchesBusqueda && matchesCategoria && matchesEstado;
    })
    .sort((a, b) => {
      switch (filtros.ordenarPor) {
        case 'nombre_asc': return a.nombre.localeCompare(b.nombre);
        case 'nombre_desc': return b.nombre.localeCompare(a.nombre);
        case 'precio_asc': return (a.precio || 0) - (b.precio || 0);
        case 'precio_desc': return (b.precio || 0) - (a.precio || 0);
        case 'stock_asc': return (a.stock || 0) - (b.stock || 0);
        case 'stock_desc': return (b.stock || 0) - (a.stock || 0);
        case 'categoria_asc': return (a.categoria || '').localeCompare(b.categoria || '');
        default: return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-200">📦 Control de Inventario ({productos.length})</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingProduct(null);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          {showForm ? '❌ Cancelar' : '➕ Agregar Producto'}
        </button>
      </div>

      {/* Panel de filtros */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-4 sm:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-gray-200">🔍 Filtros</h3>
          <button
            onClick={() => setFiltros({
              busqueda: '',
              categoria: 'todas',
              estado: 'todos',
              ordenarPor: 'nombre_asc'
            })}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
          >
            🔄 Limpiar Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
              placeholder="Nombre o código..."
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Categoría
            </label>
            <select
              value={filtros.categoria}
              onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          {/* Estado de stock */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos los estados</option>
              <option value="en_stock">✅ En Stock</option>
              <option value="stock_bajo">⚠️ Stock Bajo</option>
              <option value="sin_stock">❌ Sin Stock</option>
            </select>
          </div>

          {/* Ordenar por */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Ordenar por
            </label>
            <select
              value={filtros.ordenarPor}
              onChange={(e) => setFiltros({...filtros, ordenarPor: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="nombre_asc">Nombre A-Z</option>
              <option value="nombre_desc">Nombre Z-A</option>
              <option value="precio_asc">Precio menor a mayor</option>
              <option value="precio_desc">Precio mayor a menor</option>
              <option value="stock_asc">Stock menor a mayor</option>
              <option value="stock_desc">Stock mayor a menor</option>
              <option value="categoria_asc">Categoría A-Z</option>
            </select>
          </div>
        </div>

        {/* Resultados de filtro */}
        <div className="mt-4 text-sm text-gray-400">
          Mostrando {productosFiltrados.length} de {productos.length} productos
          {filtros.busqueda && (
            <span className="ml-2 text-blue-400">
              • Búsqueda: "{filtros.busqueda}"
            </span>
          )}
          {filtros.categoria !== 'todas' && (
            <span className="ml-2 text-green-400">
              • Categoría: {filtros.categoria}
            </span>
          )}
          {filtros.estado !== 'todos' && (
            <span className="ml-2 text-yellow-400">
              • Estado: {filtros.estado.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Estadísticas de inventario */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 border border-blue-700 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-300">Total Productos</h3>
          <p className="text-2xl font-bold text-blue-400">{productos.length}</p>
        </div>
        <div className="bg-gray-800 border border-green-700 p-4 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors"
             onClick={() => setFiltros({...filtros, estado: 'en_stock'})}>
          <h3 className="font-semibold text-green-300">En Stock</h3>
          <p className="text-2xl font-bold text-green-400">
            {productos.filter(p => (p.stock || 0) > 5).length}
          </p>
        </div>
        <div className="bg-gray-800 border border-red-700 p-4 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors"
             onClick={() => setFiltros({...filtros, estado: 'sin_stock'})}>
          <h3 className="font-semibold text-red-300">Sin Stock</h3>
          <p className="text-2xl font-bold text-red-400">
            {productos.filter(p => (p.stock || 0) === 0).length}
          </p>
        </div>
        <div className="bg-gray-800 border border-yellow-700 p-4 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors"
             onClick={() => setFiltros({...filtros, estado: 'stock_bajo'})}>
          <h3 className="font-semibold text-yellow-300">Stock Bajo</h3>
          <p className="text-2xl font-bold text-yellow-400">
            {productos.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length}
          </p>
        </div>
      </div>

      {(showForm || editingProduct) && (
        <ProductForm 
          product={editingProduct}
          onSuccess={() => { 
            setShowForm(false); 
            setEditingProduct(null);
            fetchProductos(); 
          }}
          generarCodigo={generarCodigo}
        />
      )}

      {/* Lista de productos filtrados */}
      {productosFiltrados.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 sm:p-12 text-center">
          <div className="text-gray-500 text-4xl sm:text-6xl mb-4">📦</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">No hay productos</h3>
          <p className="text-gray-400 text-sm sm:text-base">No se encontraron productos con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosFiltrados.map(producto => (
            <ProductCard 
              key={producto.id} 
              producto={producto} 
              onUpdate={fetchProductos}
              onEdit={setEditingProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Product Card en modo oscuro
function ProductCard({ producto, onUpdate, onEdit }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/productos/${producto.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Producto eliminado exitosamente');
        onUpdate();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || 'Error al eliminar'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión al eliminar producto');
    } finally {
      setIsDeleting(false);
    }
  };

  // Estado del stock
  const stockStatus = (stock) => {
    if (stock === 0 || stock === null || stock === undefined) {
      return { text: 'Sin Stock', color: 'text-red-400 bg-red-900 border-red-700', icon: '❌' };
    } else if (stock <= 5) {
      return { text: 'Stock Bajo', color: 'text-yellow-400 bg-yellow-900 border-yellow-700', icon: '⚠️' };
    } else {
      return { text: 'En Stock', color: 'text-green-400 bg-green-900 border-green-700', icon: '✅' };
    }
  };

  const status = stockStatus(producto.stock);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
      {/* Imagen y código */}
      <div className="relative">
        {producto.imagen && (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        )}
        <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-mono">
          {producto.codigo || `ID-${producto.id}`}
        </div>
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium border ${status.color}`}>
          {status.icon} {status.text}
        </div>
      </div>

      {/* Información completa */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-200">{producto.nombre}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Precio:</span>
            <span className="font-bold text-blue-400">${parseInt(producto.precio).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Stock:</span>
            <span className={`font-medium ${status.color.split(' ')[0]}`}>
              {producto.stock || 0} unidades
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Categoría:</span>
            <span className="text-gray-300">{producto.categoria}</span>
          </div>
        </div>

        {producto.descripcion && (
          <p className="text-sm text-gray-400 mt-2 line-clamp-2">{producto.descripcion}</p>
        )}

        {/* Botones de acción */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onEdit(producto)}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            ✏️ Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors disabled:bg-gray-500"
          >
            {isDeleting ? '⏳' : '🗑️'} Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

// Formulario en modo oscuro
function ProductForm({ product, onSuccess, generarCodigo }) {
  const [formData, setFormData] = useState({
    nombre: product?.nombre || '',
    precio: product?.precio || '',
    descripcion: product?.descripcion || '',
    categoria: product?.categoria || '',
    imagen: product?.imagen || '',
    nutricional: product?.nutricional || '',
    stock: product?.stock || '',
    codigo: product?.codigo || (product ? product.codigo : generarCodigo())
  });
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!product;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `${API_URL}/productos/${product.id}`
        : `${API_URL}/productos`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio),
          stock: parseInt(formData.stock) || 0
        })
      });

      if (response.ok) {
        alert(`✅ Producto ${isEditing ? 'actualizado' : 'agregado'} exitosamente`);
        onSuccess();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || 'Error al guardar'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 mb-6">
      <h3 className="text-lg font-bold mb-4 text-gray-200">
        {isEditing ? `✏️ Editar: ${product.nombre}` : '➕ Agregar Nuevo Producto'}
      </h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Código</label>
          <input
            type="text"
            value={formData.codigo}
            onChange={(e) => setFormData({...formData, codigo: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="SC-0001"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Nombre *</label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nombre del producto"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Precio *</label>
          <input
            type="number"
            value={formData.precio}
            onChange={(e) => setFormData({...formData, precio: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Categoría *</label>
          <input
            type="text"
            value={formData.categoria}
            onChange={(e) => setFormData({...formData, categoria: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Lácteos, Bebidas, etc."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Stock</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({...formData, stock: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">URL Imagen</label>
          <input
            type="url"
            value={formData.imagen}
            onChange={(e) => setFormData({...formData, imagen: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-300">Descripción</label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="2"
            placeholder="Descripción del producto"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium mb-1 text-gray-300">Info Nutricional</label>
          <textarea
            value={formData.nutricional}
            onChange={(e) => setFormData({...formData, nutricional: e.target.value})}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="2"
            placeholder="Información nutricional"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3 flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500"
          >
            {isLoading ? '⏳ Guardando...' : `💾 ${isEditing ? 'Actualizar' : 'Agregar'} Producto`}
          </button>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setFormData({
                nombre: '', precio: '', descripcion: '', nutricional: '',
                categoria: '', imagen: '', stock: '', codigo: generarCodigo()
              })}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              🔄 Limpiar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// Componente de usuarios en modo oscuro
function UsuariosSection() {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem('token');
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
      <div className="p-6 bg-gray-900 min-h-screen">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-200 mb-6">Gestión de Usuarios ({usuarios.length})</h2>

      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {usuarios.map(usuario => (
              <tr key={usuario.id} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{usuario.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 font-medium">
                  {usuario.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {usuario.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full border ${
                    usuario.rol === 'admin' 
                      ? 'bg-red-900 text-red-300 border-red-700' 
                      : 'bg-blue-900 text-blue-300 border-blue-700'
                  }`}>
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
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