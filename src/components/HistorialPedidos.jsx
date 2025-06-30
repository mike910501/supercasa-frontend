import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import { toast } from 'react-hot-toast';

export default function HistorialPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    obtenerMisPedidos();
  }, []);

  const obtenerMisPedidos = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPedidos(data);
        console.log('📦 Mis pedidos cargados:', data);
      } else {
        toast.error('Error al cargar el historial');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar pedidos por estado
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroEstado === 'todos') return true;
    return pedido.estado.toLowerCase() === filtroEstado.toLowerCase();
  });

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'entregado': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': return '⏳';
      case 'entregado': return '✅';
      case 'cancelado': return '❌';
      default: return '📦';
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearNumeroPedido = (id) => {
    return `SUP-${id.toString().padStart(3, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Cargando tu historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📋 Mi Historial de Pedidos
              </h1>
              <p className="text-gray-600 mt-1">
                {pedidosFiltrados.length} pedidos encontrados
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="entregado">Entregados</option>
                <option value="cancelado">Cancelados</option>
              </select>
              
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm"
              >
                🛍️ Volver a la Tienda
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4">
            <div className="text-center">
              <div className="text-blue-600 text-xl sm:text-2xl font-bold">
                {pedidos.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Total Pedidos</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4">
            <div className="text-center">
              <div className="text-green-600 text-xl sm:text-2xl font-bold">
                {pedidos.filter(p => p.estado?.toLowerCase() === 'entregado').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Entregados</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4">
            <div className="text-center">
              <div className="text-yellow-600 text-xl sm:text-2xl font-bold">
                {pedidos.filter(p => p.estado?.toLowerCase() === 'pendiente').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Pendientes</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4">
            <div className="text-center">
              <div className="text-purple-600 text-xl sm:text-2xl font-bold">
                ${pedidos.reduce((acc, p) => acc + (p.total || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Total Gastado</div>
            </div>
          </div>
        </div>

        {/* Lista de pedidos */}
        {pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="text-gray-400 text-4xl sm:text-6xl mb-4">📦</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
              {filtroEstado === 'todos' ? 'No tienes pedidos aún' : `No tienes pedidos ${filtroEstado}s`}
            </h3>
            <p className="text-gray-500 text-sm sm:text-base mb-4">
              {filtroEstado === 'todos' 
                ? '¡Haz tu primer pedido y aparecerá aquí!' 
                : `Cambia el filtro para ver otros pedidos`}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              🛍️ Ir a la Tienda
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosFiltrados.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-4 sm:p-6">
                  {/* Header del pedido */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getEstadoIcon(pedido.estado)}</div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                          Pedido {formatearNumeroPedido(pedido.id)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatearFecha(pedido.fecha)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getEstadoColor(pedido.estado)}`}>
                        {pedido.estado}
                      </span>
                      <div className="text-right">
                        <div className="text-lg sm:text-xl font-bold text-blue-600">
                          ${pedido.total?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información del pedido */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs font-medium text-gray-500 mb-1">PRODUCTOS</div>
                      <div className="text-sm font-medium text-gray-800">
                        {pedido.productos?.length || 0} productos
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-xs font-medium text-gray-500 mb-1">ENTREGA</div>
                      <div className="text-sm font-medium text-gray-800">
                        Torre {pedido.torre_entrega} - Piso {pedido.piso_entrega}
                      </div>
                      <div className="text-xs text-gray-600">
                        Apt {pedido.apartamento_entrega}
                      </div>
                    </div>
                    
                    {pedido.payment_method && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="text-xs font-medium text-gray-500 mb-1">PAGO</div>
                        <div className="text-sm font-medium text-gray-800">
                          {pedido.payment_method === 'NEQUI' ? '📱 Nequi' :
                           pedido.payment_method === 'PSE' ? '🏦 PSE' :
                           pedido.payment_method === 'CARD' ? '💳 Tarjeta' :
                           '💵 Efectivo'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botón Ver Detalles */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setPedidoSeleccionado(pedido);
                        setShowModal(true);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      👁️ Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showModal && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
                  Detalles del Pedido {formatearNumeroPedido(pedidoSeleccionado.id)}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {/* Estado y fechas */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">ESTADO ACTUAL</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getEstadoIcon(pedidoSeleccionado.estado)}</span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getEstadoColor(pedidoSeleccionado.estado)}`}>
                        {pedidoSeleccionado.estado}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">FECHAS</div>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Pedido:</span> {formatearFecha(pedidoSeleccionado.fecha)}
                      </div>
                      {pedidoSeleccionado.fecha_entrega && (
                        <div className="text-sm">
                          <span className="font-medium">Entregado:</span> {formatearFecha(pedidoSeleccionado.fecha_entrega)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  📦 Productos ({pedidoSeleccionado.productos?.length || 0})
                </h3>
                <div className="space-y-3">
                  {pedidoSeleccionado.productos?.map((producto, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          {producto.codigo && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono bg-blue-100 text-blue-800 border">
                              📋 {producto.codigo}
                            </span>
                          )}
                          <h4 className="font-medium text-gray-800">{producto.nombre}</h4>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>Cantidad: {producto.cantidad}</span>
                          <span className="mx-2">•</span>
                          <span>Precio unitario: ${producto.precio?.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-bold text-blue-600">
                          ${((producto.precio || 0) * (producto.cantidad || 0)).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg sm:text-xl font-bold text-gray-800">Total del Pedido:</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">
                    ${pedidoSeleccionado.total?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}