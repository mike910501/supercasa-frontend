// ✅ DASHBOARD ARREGLADO - CRUD COMPLETO CON INVENTARIO
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config/api';

export default function Dashboard() {
  const [productos, setProductos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});
  const [cargando, setCargando] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // ✅ OBTENER TOKEN PARA AUTENTICACIÓN
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const cargarProductos = () => {
    fetch(`${API_URL}/productos`)
      .then(res => res.json())
      .then(data => {
        setProductos(data);
        setCargando(false);
      })
      .catch(err => {
        console.error('Error al cargar productos:', err);
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // ✅ ELIMINAR CON AUTENTICACIÓN CORREGIDA
  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;

    try {
      const response = await fetch(`${API_URL}/productos/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders() // ✅ AGREGADO: Headers de autenticación
      });

      if (response.ok) {
        setProductos(productos.filter(p => p.id !== id));
        alert('✅ Producto eliminado correctamente');
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error}`);
      }
    } catch (err) {
      console.error('Error eliminando:', err);
      alert('❌ Error de conexión');
    }
  };

  // ✅ EDITAR CON TODOS LOS CAMPOS
  const guardarCambios = async (id) => {
    try {
      const response = await fetch(`${API_URL}/productos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(), // ✅ AGREGADO: Headers de autenticación
        body: JSON.stringify(form)
      });

      if (response.ok) {
        setEditando(null);
        cargarProductos();
        alert('✅ Producto actualizado correctamente');
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error}`);
      }
    } catch (err) {
      console.error('Error editando:', err);
      alert('❌ Error de conexión');
    }
  };

  // ✅ COMENZAR EDICIÓN CON TODOS LOS CAMPOS
  const comenzarEdicion = (producto) => {
    setEditando(producto.id);
    setForm({
      nombre: producto.nombre || '',
      precio: producto.precio || '',
      descripcion: producto.descripcion || '',
      nutricional: producto.nutricional || '',
      categoria: producto.categoria || '',
      imagen: producto.imagen || '',
      stock: producto.stock || 0,
      codigo: producto.codigo || ''
    });
  };

  // ✅ GENERAR CÓDIGO AUTOMÁTICO
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">📦 Control de Inventario</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {showAddForm ? '❌ Cancelar' : '➕ Agregar Producto'}
          </button>
          <Link
            to="/dashboard/orders"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            📋 Ver Pedidos
          </Link>
        </div>
      </div>

      {/* ✅ FORMULARIO PARA AGREGAR PRODUCTOS */}
      {showAddForm && (
        <ProductFormInline 
          onSuccess={() => {
            setShowAddForm(false);
            cargarProductos();
          }}
          generarCodigo={generarCodigo}
        />
      )}

      {/* ✅ ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total Productos</h3>
          <p className="text-2xl font-bold text-blue-600">{productos.length}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">En Stock</h3>
          <p className="text-2xl font-bold text-green-600">
            {productos.filter(p => (p.stock || 0) > 0).length}
          </p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800">Sin Stock</h3>
          <p className="text-2xl font-bold text-red-600">
            {productos.filter(p => (p.stock || 0) === 0).length}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Stock Bajo</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {productos.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length}
          </p>
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Cargando productos...</p>
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold mb-2">No hay productos aún</h3>
          <p className="text-gray-600 mb-4">Agrega tu primer producto para comenzar</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            ➕ Agregar Primer Producto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos.map((producto) => (
            <div key={producto.id} className="border rounded-lg shadow-lg overflow-hidden bg-white">
              {editando === producto.id ? (
                <EditForm 
                  form={form} 
                  setForm={setForm} 
                  onSave={() => guardarCambios(producto.id)}
                  onCancel={() => setEditando(null)}
                />
              ) : (
                <ProductCard 
                  producto={producto} 
                  onEdit={() => comenzarEdicion(producto)}
                  onDelete={() => eliminarProducto(producto.id)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ✅ COMPONENTE PARA AGREGAR PRODUCTOS
function ProductFormInline({ onSuccess, generarCodigo }) {
  const [producto, setProducto] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    nutricional: '',
    categoria: '',
    imagen: '',
    stock: '',
    codigo: generarCodigo()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/productos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...producto,
          precio: parseFloat(producto.precio),
          stock: parseInt(producto.stock) || 0
        })
      });

      if (response.ok) {
        alert('✅ Producto creado exitosamente');
        onSuccess();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error}`);
      }
    } catch (err) {
      console.error('Error creando producto:', err);
      alert('❌ Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">➕ Agregar Nuevo Producto</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Código</label>
          <input
            type="text"
            value={producto.codigo}
            onChange={(e) => setProducto({...producto, codigo: e.target.value})}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="SC-0001"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nombre *</label>
          <input
            type="text"
            value={producto.nombre}
            onChange={(e) => setProducto({...producto, nombre: e.target.value})}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Nombre del producto"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Precio *</label>
          <input
            type="number"
            value={producto.precio}
            onChange={(e) => setProducto({...producto, precio: e.target.value})}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categoría *</label>
          <input
            type="text"
            value={producto.categoria}
            onChange={(e) => setProducto({...producto, categoria: e.target.value})}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="Lácteos, Bebidas, etc."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stock Inicial</label>
          <input
            type="number"
            value={producto.stock}
            onChange={(e) => setProducto({...producto, stock: e.target.value})}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL Imagen</label>
          <input
            type="url"
            value={producto.imagen}
            onChange={(e) => setProducto({...producto, imagen: e.target.value})}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            value={producto.descripcion}
            onChange={(e) => setProducto({...producto, descripcion: e.target.value})}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="Descripción del producto"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium mb-1">Info Nutricional</label>
          <textarea
            value={producto.nutricional}
            onChange={(e) => setProducto({...producto, nutricional: e.target.value})}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="Información nutricional"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3 flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {isSubmitting ? '⏳ Guardando...' : '💾 Guardar Producto'}
          </button>
          <button
            type="button"
            onClick={() => setProducto({
              nombre: '', precio: '', descripcion: '', nutricional: '',
              categoria: '', imagen: '', stock: '', codigo: generarCodigo()
            })}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            🔄 Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}

// ✅ COMPONENTE PARA MOSTRAR PRODUCTO
function ProductCard({ producto, onEdit, onDelete }) {
  const stockStatus = (stock) => {
    if (stock === 0 || stock === null || stock === undefined) {
      return { text: 'Sin Stock', color: 'text-red-600 bg-red-100', icon: '❌' };
    } else if (stock <= 5) {
      return { text: 'Stock Bajo', color: 'text-yellow-600 bg-yellow-100', icon: '⚠️' };
    } else {
      return { text: 'En Stock', color: 'text-green-600 bg-green-100', icon: '✅' };
    }
  };

  const status = stockStatus(producto.stock);

  return (
    <>
      {/* ✅ IMAGEN Y CÓDIGO */}
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
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${status.color}`}>
          {status.icon} {status.text}
        </div>
      </div>

      {/* ✅ INFORMACIÓN COMPLETA */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{producto.nombre}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Precio:</span>
            <span className="font-bold text-blue-600">${parseInt(producto.precio).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Stock:</span>
            <span className={`font-medium ${status.color.split(' ')[0]}`}>
              {producto.stock || 0} unidades
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Categoría:</span>
            <span className="text-gray-800">{producto.categoria}</span>
          </div>
        </div>

        {producto.descripcion && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{producto.descripcion}</p>
        )}

        {/* ✅ BOTONES DE ACCIÓN */}
        <div className="mt-4 flex justify-between gap-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            ✏️ Editar
          </button>
          <button
            onClick={onDelete}
            className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
          >
            🗑 Eliminar
          </button>
        </div>
      </div>
    </>
  );
}

// ✅ COMPONENTE PARA EDITAR
function EditForm({ form, setForm, onSave, onCancel }) {
  return (
    <div className="p-4 bg-gray-50">
      <h4 className="font-semibold mb-3">✏️ Editando Producto</h4>
      <div className="space-y-3">
        <input
          className="w-full border px-3 py-2 rounded text-sm"
          placeholder="Código"
          value={form.codigo || ''}
          onChange={e => setForm({ ...form, codigo: e.target.value })}
        />
        <input
          className="w-full border px-3 py-2 rounded text-sm"
          placeholder="Nombre"
          value={form.nombre || ''}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
        />
        <input
          className="w-full border px-3 py-2 rounded text-sm"
          placeholder="Precio"
          type="number"
          value={form.precio || ''}
          onChange={e => setForm({ ...form, precio: e.target.value })}
        />
        <input
          className="w-full border px-3 py-2 rounded text-sm"
          placeholder="Categoría"
          value={form.categoria || ''}
          onChange={e => setForm({ ...form, categoria: e.target.value })}
        />
        <input
          className="w-full border px-3 py-2 rounded text-sm"
          placeholder="Stock"
          type="number"
          value={form.stock || ''}
          onChange={e => setForm({ ...form, stock: e.target.value })}
        />
        <input
          className="w-full border px-3 py-2 rounded text-sm"
          placeholder="URL Imagen"
          value={form.imagen || ''}
          onChange={e => setForm({ ...form, imagen: e.target.value })}
        />
        <textarea
          className="w-full border px-3 py-2 rounded text-sm"
          placeholder="Descripción"
          rows="2"
          value={form.descripcion || ''}
          onChange={e => setForm({ ...form, descripcion: e.target.value })}
        />
        <textarea
          className="w-full border px-3 py-2 rounded text-sm"
          placeholder="Info Nutricional"
          rows="2"
          value={form.nutricional || ''}
          onChange={e => setForm({ ...form, nutricional: e.target.value })}
        />
        
        <div className="flex gap-2 pt-2">
          <button
            className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
            onClick={onSave}
          >
            💾 Guardar
          </button>
          <button
            className="flex-1 bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600"
            onClick={onCancel}
          >
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}