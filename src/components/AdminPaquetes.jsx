// AdminPaquetes.jsx - Crear en src/components/
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import API_URL from '../config/api';

const AdminPaquetes = () => {
  const [paquetes, setPaquetes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPaquete, setEditingPaquete] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_paquete: '',
    categoria: 'general',
    imagen: '',
    productos: [], // [{producto_id, cantidad}]
    fecha_inicio: '',
    fecha_fin: ''
  });

  // Estado para el constructor visual
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [busquedaProducto, setBusquedaProducto] = useState('');

  useEffect(() => {
    cargarPaquetes();
    cargarProductos();
  }, []);

  const cargarPaquetes = async () => {
    try {
      const response = await fetch(`${API_URL}/paquetes`);
      const data = await response.json();
      if (data.success) {
        setPaquetes(data.paquetes);
      }
    } catch (error) {
      console.error('Error cargando paquetes:', error);
      toast.error('Error cargando paquetes');
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await fetch(`${API_URL}/productos`);
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
      toast.error('Error cargando productos');
    }
  };

  const calcularEstadisticas = () => {
    const precioIndividual = productosSeleccionados.reduce((sum, item) => {
      const producto = productos.find(p => p.id === item.producto_id);
      return sum + (producto ? producto.precio * item.cantidad : 0);
    }, 0);
    
    const precioPaquete = parseFloat(formData.precio_paquete) || 0;
    const ahorro = precioIndividual - precioPaquete;
    const ahorroPercentaje = precioIndividual > 0 ? (ahorro / precioIndividual) * 100 : 0;
    
    // Calcular stock máximo de paquetes
    const stockMaximo = productosSeleccionados.length > 0 
      ? Math.min(...productosSeleccionados.map(item => {
          const producto = productos.find(p => p.id === item.producto_id);
          return producto ? Math.floor(producto.stock / item.cantidad) : 0;
        }))
      : 0;

    return {
      precioIndividual,
      precioPaquete,
      ahorro,
      ahorroPercentaje,
      stockMaximo
    };
  };

  const agregarProducto = (producto) => {
    const existe = productosSeleccionados.find(p => p.producto_id === producto.id);
    if (existe) {
      setProductosSeleccionados(prev => 
        prev.map(p => 
          p.producto_id === producto.id 
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        )
      );
    } else {
      setProductosSeleccionados(prev => [
        ...prev,
        { producto_id: producto.id, cantidad: 1 }
      ]);
    }
    setBusquedaProducto('');
  };

  const quitarProducto = (producto_id) => {
    setProductosSeleccionados(prev => 
      prev.filter(p => p.producto_id !== producto_id)
    );
  };

  const cambiarCantidad = (producto_id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      quitarProducto(producto_id);
      return;
    }
    
    setProductosSeleccionados(prev =>
      prev.map(p =>
        p.producto_id === producto_id
          ? { ...p, cantidad: nuevaCantidad }
          : p
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (productosSeleccionados.length === 0) {
      toast.error('Debe agregar al menos un producto al paquete');
      return;
    }

    const stats = calcularEstadisticas();
    if (stats.ahorroPercentaje < 5) {
      const continuar = window.confirm(
        `El ahorro es muy bajo (${stats.ahorroPercentaje.toFixed(1)}%). ¿Continuar?`
      );
      if (!continuar) return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = editingPaquete 
        ? `${API_URL}/api/admin/paquetes/${editingPaquete.id}`
        : `${API_URL}/api/admin/paquetes`;
      
      const method = editingPaquete ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          productos: productosSeleccionados
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(editingPaquete ? 'Paquete actualizado' : 'Paquete creado');
        cerrarModal();
        cargarPaquetes();
      } else {
        toast.error(data.error || 'Error procesando paquete');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error procesando paquete');
    } finally {
      setLoading(false);
    }
  };

  const editarPaquete = (paquete) => {
    setEditingPaquete(paquete);
    setFormData({
      nombre: paquete.nombre,
      descripcion: paquete.descripcion || '',
      precio_paquete: paquete.precio_paquete,
      categoria: paquete.categoria,
      imagen: paquete.imagen || '',
      fecha_inicio: paquete.fecha_inicio ? paquete.fecha_inicio.split('T')[0] : '',
      fecha_fin: paquete.fecha_fin ? paquete.fecha_fin.split('T')[0] : ''
    });
    
    // Cargar productos del paquete
    if (paquete.productos_incluidos) {
      setProductosSeleccionados(
        paquete.productos_incluidos.map(p => ({
          producto_id: p.producto_id,
          cantidad: p.cantidad
        }))
      );
    }
    
    setShowModal(true);
  };

  const eliminarPaquete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este paquete?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/paquetes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Paquete eliminado');
        cargarPaquetes();
      } else {
        toast.error(data.error || 'Error eliminando paquete');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error eliminando paquete');
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingPaquete(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio_paquete: '',
      categoria: 'general',
      imagen: '',
      productos: [],
      fecha_inicio: '',
      fecha_fin: ''
    });
    setProductosSeleccionados([]);
    setBusquedaProducto('');
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) &&
    !productosSeleccionados.find(ps => ps.producto_id === p.id)
  );

  const stats = calcularEstadisticas();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🎁 Gestión de Paquetes</h1>
          <p className="text-gray-600">Crea y administra paquetes promocionales</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all shadow-lg"
        >
          🎁 Crear Paquete
        </button>
      </div>

      {/* Lista de paquetes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paquetes.map(paquete => (
          <div key={paquete.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">{paquete.nombre}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  paquete.activo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {paquete.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{paquete.descripcion}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio paquete:</span>
                  <span className="font-bold text-amber-600">
                    ${paquete.precio_paquete?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio individual:</span>
                  <span className="text-gray-500 line-through">
                    ${paquete.precio_individual_total?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ahorro:</span>
                  <span className="font-bold text-green-600">
  ${Number(stats.ahorro || 0).toLocaleString()} ({Number(stats.ahorroPercentaje || 0).toFixed(1)}%)
</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock disponible:</span>
                  <span className={`font-medium ${
  (paquete.stock_paquetes_disponibles || 0) > 0 ? 'text-green-600' : 'text-red-600'
}`}>
  {paquete.stock_paquetes_disponibles || 0} paquetes
</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => editarPaquete(paquete)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => eliminarPaquete(paquete.id)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal constructor de paquetes */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  🎁 {editingPaquete ? 'Editar' : 'Crear'} Paquete
                </h2>
                <button
                  onClick={cerrarModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Columna izquierda - Información del paquete */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Paquete *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Ej: Básicos Familia"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      rows={3}
                      placeholder="Descripción del paquete..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio del Paquete *
                      </label>
                      <input
                        type="number"
                        value={formData.precio_paquete}
                        onChange={(e) => setFormData(prev => ({ ...prev, precio_paquete: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="15000"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría
                      </label>
                      <select
                        value={formData.categoria}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="general">General</option>
                        <option value="basicos">Básicos</option>
                        <option value="desayuno">Desayuno</option>
                        <option value="limpieza">Limpieza</option>
                        <option value="snacks">Snacks</option>
                        <option value="bebidas">Bebidas</option>
                      </select>
                    </div>
                  </div>

                  {/* Calculadora automática */}
                  <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
                    <h3 className="font-bold text-amber-800 mb-3">📊 Calculadora Automática</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Precio individual total:</span>
                        <span className="font-medium">${stats.precioIndividual.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tu precio del paquete:</span>
                        <span className="font-bold text-amber-600">${stats.precioPaquete.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-amber-200 pt-2">
                        <span>Ahorro cliente:</span>
                       
<span className="font-bold text-green-600">
  ${Number(stats.ahorro || 0).toLocaleString()} ({Number(stats.ahorroPercentaje || 0).toFixed(1)}%)
</span>                      </div>
                      <div className="flex justify-between">
                        <span>Paquetes armables:</span>
                        <span className={`font-bold ${stats.stockMaximo > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stats.stockMaximo} paquetes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna derecha - Constructor de productos */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">🛒 Constructor de Productos</h3>
                    
                    {/* Buscador de productos */}
                    <div className="mb-4">
                      <input
                        type="text"
                        value={busquedaProducto}
                        onChange={(e) => setBusquedaProducto(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Buscar producto para agregar..."
                      />
                    </div>

                    {/* Resultados de búsqueda */}
                    {busquedaProducto && (
                      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg mb-4">
                        {productosFiltrados.slice(0, 5).map(producto => (
                          <div
                            key={producto.id}
                            onClick={() => agregarProducto(producto)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-medium">{producto.nombre}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  Stock: {producto.stock}
                                </span>
                              </div>
                              <span className="text-amber-600 font-medium">
                                ${producto.precio.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        {busquedaProducto && productosFiltrados.length === 0 && (
                          <div className="p-3 text-gray-500 text-center">
                            No se encontraron productos
                          </div>
                        )}
                      </div>
                    )}

                    {/* Productos seleccionados */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-700">Productos del paquete:</h4>
                      {productosSeleccionados.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-4xl mb-2">📦</div>
                          <p>Agrega productos al paquete</p>
                        </div>
                      ) : (
                        productosSeleccionados.map(item => {
                          const producto = productos.find(p => p.id === item.producto_id);
                          if (!producto) return null;
                          
                          return (
                            <div key={item.producto_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{producto.nombre}</div>
                                <div className="text-sm text-gray-500">
                                  ${producto.precio.toLocaleString()} c/u • Stock: {producto.stock}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                                  className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-medium">{item.cantidad}</span>
                                <button
                                  type="button"
                                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                                  className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600"
                                >
                                  +
                                </button>
                                <button
                                  type="button"
                                  onClick={() => quitarProducto(item.producto_id)}
                                  className="ml-2 w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center hover:bg-gray-600"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || productosSeleccionados.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : (editingPaquete ? 'Actualizar' : 'Crear')} Paquete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaquetes;