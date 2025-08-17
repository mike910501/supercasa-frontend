import React, { useState, useEffect } from 'react';
import API_URL, { api } from '../config/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminOrdersManagement() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTorre, setFiltroTorre] = useState('');
  const [filtroMetodoPago, setFiltroMetodoPago] = useState('todos');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [tiempoActual, setTiempoActual] = useState(new Date());
  const [activeTab, setActiveTab] = useState('resumen'); // Nuevo estado para tabs

  // Funciones auxiliares
  const getMetodoPago = (pedido) => {
    if (pedido.payment_reference && pedido.payment_reference !== null) {
      return 'Digital';
    } else {
      return 'Efectivo';
    }
  };

  const getMetodoPagoIcon = (pedido) => {
    const metodo = getMetodoPago(pedido);
    return metodo === 'Digital' ? '💳' : '💵';
  };

  // Actualizar tiempo cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setTiempoActual(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-actualización
  useEffect(() => {
    obtenerPedidos(true);
    const interval = setInterval(() => {
      if (autoUpdate && !showModal) {
        obtenerPedidos(false);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [autoUpdate, showModal]);

const obtenerPedidos = async (initialLoad = false) => {
    if (initialLoad) {
      setIsLoading(true);
    } else {
      setIsUpdating(true);
    }
    
    try {
      const nuevosPedidos = await api.get('/api/admin/pedidos', navigate);
      
      if (!initialLoad && pedidos.length > 0) {
        const nuevosIds = nuevosPedidos.map(p => p.id);
        const viejosIds = pedidos.map(p => p.id);
        const pedidosNuevos = nuevosIds.filter(id => !viejosIds.includes(id));
        
        if (pedidosNuevos.length > 0) {
          toast.success(`🆕 ${pedidosNuevos.length} nuevo${pedidosNuevos.length > 1 ? 's' : ''} pedido${pedidosNuevos.length > 1 ? 's' : ''}!`, {
            duration: 4000,
          });
        }
      }
      
      setPedidos(nuevosPedidos);
      
      // DEBUG TEMPORAL - AQUÍ SÍ EXISTE nuevosPedidos
      const pedido335 = nuevosPedidos.find(p => p.id === 335);
      if (pedido335) {
        console.log('📦 PEDIDO 335:', pedido335);
      }
      
      setUltimaActualizacion(new Date());
    } catch (error) {
      if (initialLoad) {
        toast.error(error.message);
      }
    } finally {
      if (initialLoad) {
        setIsLoading(false);
      } else {
        setIsUpdating(false);
      }
    }
  };

 
      
    

 const calcularDesglose = (pedido) => {
    // Calcular subtotal de productos
    const subtotalProductos = pedido.productos?.reduce((acc, p) => 
      acc + (p.precio * p.cantidad), 0) || 0;
    
    // Obtener descuentos del backend
    const descuentoCupon = pedido.descuento_cupon || 0;
    const descuentoCanje = pedido.descuento_canje || 0;
    
    // Calcular costo de envío basado en método de pago y subtotal
    let costoEnvio = 0;
    const subtotalConDescuentos = subtotalProductos - descuentoCupon - descuentoCanje;
    
    if (pedido.metodo_pago === 'EFECTIVO' || !pedido.payment_reference) {
      // Pago en efectivo
      if (subtotalConDescuentos >= 15000) {
        costoEnvio = 0; // Gratis
      } else if (subtotalConDescuentos >= 5000) {
        costoEnvio = 2000;
      } else {
        costoEnvio = 5000;
      }
    } else {
      // Pago digital
      costoEnvio = subtotalConDescuentos >= 20000 ? 0 : 2000;
    }
    
    // Si el backend ya envía costo_envio, usarlo
    if (pedido.costo_envio !== undefined && pedido.costo_envio !== null) {
      costoEnvio = pedido.costo_envio;
    }
    
    return {
      subtotal: subtotalProductos,
      descuentoCupon,
      descuentoCanje,
      costoEnvio,
      total: pedido.total || (subtotalProductos - descuentoCupon - descuentoCanje + costoEnvio),
      tieneDescuentos: (descuentoCupon + descuentoCanje) > 0
    };
  };

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    const matchesEstado = filtroEstado === 'todos' || pedido.estado === filtroEstado;
    const matchesTorre = filtroTorre === '' || pedido.torre_entrega === filtroTorre;
    const matchesMetodoPago = filtroMetodoPago === 'todos' || getMetodoPago(pedido) === filtroMetodoPago;
    return matchesEstado && matchesTorre && matchesMetodoPago;
  });

  // Cambiar estado de pedido
  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      await api.put(`/api/admin/pedidos/${pedidoId}/estado`, { estado: nuevoEstado }, navigate);
      
      toast.success(`Pedido ${nuevoEstado === 'entregado' ? 'entregado' : 'actualizado'} ✅`);
      
      setPedidos(pedidos.map(pedido => 
        pedido.id === pedidoId 
          ? { 
              ...pedido, 
              estado: nuevoEstado,
              fecha_entrega: nuevoEstado === 'entregado' ? new Date().toISOString() : null
            }
          : pedido
      ));
      
      if (pedidoSeleccionado && pedidoSeleccionado.id === pedidoId) {
        setPedidoSeleccionado({
          ...pedidoSeleccionado,
          estado: nuevoEstado,
          fecha_entrega: nuevoEstado === 'entregado' ? new Date().toISOString() : null
        });
      }

    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

const formatearTiempo = (fecha) => {
  if (!fecha) return '---'; // En lugar de 'Sin fecha'
  
  try {
    const ahora = new Date();
    const fechaPedido = new Date(fecha);
    
    if (isNaN(fechaPedido.getTime())) {
      return '---';
    }
    
    const diffMinutos = Math.floor((ahora - fechaPedido) / (1000 * 60));
    
    if (diffMinutos < 1) return 'Ahora';
    if (diffMinutos < 60) return `${diffMinutos}m`;
    if (diffMinutos < 1440) return `${Math.floor(diffMinutos / 60)}h ${diffMinutos % 60}m`;
    return `${Math.floor(diffMinutos / 1440)}d`;
  } catch (error) {
    return '---';
  }
};

  const getEstadoStyle = (estado) => {
    switch (estado) {
      case 'pendiente': 
      case 'Pendiente': 
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'entregado': 
      case 'Entregado': 
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado': 
      case 'Cancelado': 
        return 'bg-red-100 text-red-800 border-red-200';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Compacto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Título y métricas */}
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  📦 Gestión de Entregas
                  {isUpdating && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  )}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {pedidosFiltrados.length} pedidos • Actualizado hace {Math.floor((tiempoActual - ultimaActualizacion) / 1000)}s
                </p>
              </div>
              
              {/* Métricas rápidas */}
              <div className="hidden lg:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'Pendiente').length}
                  </div>
                  <div className="text-xs text-gray-500">Pendientes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {pedidos.filter(p => p.estado === 'entregado').length}
                  </div>
                  <div className="text-xs text-gray-500">Entregados</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    ${pedidos.reduce((acc, p) => acc + (p.total || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Total vendido</div>
                </div>
              </div>
            </div>
            
            {/* Controles */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="Pendiente">Pendientes</option>
                <option value="entregado">Entregados</option>
                <option value="cancelado">Cancelados</option>
              </select>
              
              <select
                value={filtroTorre}
                onChange={(e) => setFiltroTorre(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las torres</option>
                <option value="1">Torre 1</option>
                <option value="2">Torre 2</option>
                <option value="3">Torre 3</option>
                <option value="4">Torre 4</option>
                <option value="5">Torre 5</option>
              </select>

              <button
                onClick={() => setAutoUpdate(!autoUpdate)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoUpdate 
                    ? 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {autoUpdate ? '⏸️ Auto' : '▶️ Manual'}
              </button>
              
              <button
                onClick={() => obtenerPedidos(false)}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Grid de Cards Minimalistas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pedidosFiltrados.map((pedido) => (
  <div key={pedido.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    
    {/* Header del Card */}
    <div className="p-4 border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getMetodoPagoIcon(pedido)}</span>
          <span className="font-bold text-gray-900">#{pedido.id}</span>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEstadoStyle(pedido.estado)}`}>
          {pedido.estado}
        </span>
      </div>
    </div>
    
    {/* Contenido del Card */}
    <div className="p-4 space-y-3">
      {/* Cliente */}
      <div>
        <p className="font-medium text-gray-900 truncate">{pedido.usuario?.nombre}</p>
        <p className="text-sm text-gray-500">{pedido.telefono_contacto}</p>
      </div>
      
      {/* Dirección */}
      <div className="pb-2 border-b border-gray-100">
        <p className="text-sm text-gray-600">
          Torre {pedido.torre_entrega} • Piso {pedido.piso_entrega} • Apt {pedido.apartamento_entrega}
        </p>
      </div>
      
      {/* Desglose de precios */}
      <div className="space-y-1.5">
        {/* Subtotal */}
        <div className="flex justify-between text-xs text-gray-600">
          <span>Productos:</span>
          <span className="font-medium">
            ${pedido.productos?.reduce((acc, p) => 
              acc + (p.precio * p.cantidad), 0).toLocaleString() || 0}
          </span>
        </div>
        
        {/* Descuento cupón */}
        {pedido.codigo_promocional && (
          <div className="flex justify-between text-xs text-green-600">
            <span className="truncate max-w-[120px]" title={pedido.codigo_promocional}>
              {pedido.codigo_promocional}:
            </span>
            <span className="font-medium">
              -${(() => {
                const subtotal = pedido.productos?.reduce((acc, p) => 
                  acc + (p.precio * p.cantidad), 0) || 0;
                const descuento = pedido.descuento_monto || 
                  pedido.descuento_cupon || Math.floor(subtotal * 0.1);
                return descuento.toLocaleString();
              })()}
            </span>
          </div>
        )}
        
        {/* Descuento canje */}
        {pedido.codigo_canje && pedido.descuento_canje > 0 && (
          <div className="flex justify-between text-xs text-purple-600">
            <span>💎 Puntos:</span>
            <span className="font-medium">-${pedido.descuento_canje.toLocaleString()}</span>
          </div>
        )}
        
        {/* Envío */}
        <div className="flex justify-between text-xs text-gray-600">
          <span>Envío:</span>
          <span className={`font-medium ${
            pedido.costo_envio === 0 || !pedido.costo_envio ? 'text-green-600' : ''
          }`}>
            {pedido.costo_envio > 0 ? `$${pedido.costo_envio.toLocaleString()}` : 'GRATIS'}
          </span>
        </div>
      </div>
      
      {/* Total con fondo destacado */}
      <div className="bg-gray-50 -mx-4 px-4 py-2 rounded">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-900">Total:</span>
          <span className="text-lg font-bold text-green-600">
            ${pedido.total?.toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Footer info */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
        <span className="flex items-center gap-1">
          🕐 {formatearTiempo(pedido.fecha_pedido)}
        </span>
        <span>{pedido.productos?.length || 0} items</span>
      </div>
    </div>
    
    {/* Acciones */}
    <div className="p-3 bg-gray-50 rounded-b-lg border-t border-gray-100">
      <div className="flex gap-2">
        <button
          onClick={() => {
            setPedidoSeleccionado(pedido);
            setActiveTab('resumen');
            setShowModal(true);
          }}
          className="flex-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Ver detalles
        </button>
        
        {(pedido.estado === 'pendiente' || pedido.estado === 'Pendiente') && (
          <button
            onClick={() => cambiarEstadoPedido(pedido.id, 'entregado')}
            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            ✓
          </button>
        )}
      </div>
    </div>
  </div>
))}
        </div>

        {/* Mensaje cuando no hay pedidos */}
        {pedidosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pedidos</h3>
            <p className="text-gray-500">No se encontraron pedidos con los filtros seleccionados</p>
          </div>
        )}
      </div>

      {/* Modal Rediseñado con Tabs */}
      {showModal && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Pedido #{pedidoSeleccionado.id}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {pedidoSeleccionado.usuario?.nombre} • {formatearTiempo(pedidoSeleccionado.fecha_pedido)}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex px-6">
                {[
                  { id: 'resumen', name: '📋 Resumen', icon: '📋' },
                  { id: 'cliente', name: '👤 Cliente', icon: '👤' },
                  { id: 'productos', name: '🛒 Productos', icon: '🛒' },
                  { id: 'pago', name: '💳 Pago', icon: '💳' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              
              {/* Tab: Resumen */}
              {activeTab === 'resumen' && (
                <div className="space-y-6">
                  
                  {/* Estado y Acciones */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getEstadoStyle(pedidoSeleccionado.estado)}`}>
                          {pedidoSeleccionado.estado}
                        </span>
                        <span className="text-sm text-gray-600">
                          Hace {formatearTiempo(pedidoSeleccionado.fecha_pedido)}
                        </span>
                      </div>
                      
                      {(pedidoSeleccionado.estado === 'pendiente' || pedidoSeleccionado.estado === 'Pendiente') && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => cambiarEstadoPedido(pedidoSeleccionado.id, 'entregado')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                          >
                            ✓ Marcar entregado
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('¿Cancelar este pedido?')) {
                                cambiarEstadoPedido(pedidoSeleccionado.id, 'cancelado');
                                setShowModal(false);
                              }
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                          >
                            ❌ Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Grid de Información Clave */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Entrega */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        🏠 Dirección de entrega
                      </h3>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="font-medium text-gray-900">
                          Torre {pedidoSeleccionado.torre_entrega} • Piso {pedidoSeleccionado.piso_entrega} • Apt {pedidoSeleccionado.apartamento_entrega}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          ⚡ Entrega en máximo 20 minutos
                        </p>
                      </div>
                    </div>

                    {/* Total */}
<div className="space-y-3">
  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
    💰 Desglose del pedido
  </h3>
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div className="space-y-2">
      {/* Subtotal productos */}
      <div className="flex justify-between text-sm">
        <span>Productos:</span>
        <span className="font-medium">
          ${pedidoSeleccionado.productos?.reduce((acc, p) => 
            acc + (p.precio * p.cantidad), 0).toLocaleString() || 0}
        </span>
      </div>
      
      {/* Descuento código promocional */}
      {pedidoSeleccionado.codigo_promocional && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Descuento ({pedidoSeleccionado.codigo_promocional}):</span>
          <span className="font-medium">
            -${(() => {
              const subtotal = pedidoSeleccionado.productos?.reduce((acc, p) => 
                acc + (p.precio * p.cantidad), 0) || 0;
              const descuento = pedidoSeleccionado.descuento_monto || 
                pedidoSeleccionado.descuento_cupon || Math.floor(subtotal * 0.1);
              return descuento.toLocaleString();
            })()}
          </span>
        </div>
      )}
      
      {/* Descuento canje */}
      {pedidoSeleccionado.codigo_canje && pedidoSeleccionado.descuento_canje > 0 && (
        <div className="flex justify-between text-sm text-purple-600">
          <span>Canje de puntos:</span>
          <span className="font-medium">-${pedidoSeleccionado.descuento_canje.toLocaleString()}</span>
        </div>
      )}
      
      {/* Envío */}
      <div className="flex justify-between text-sm">
        <span>Envío:</span>
        <span className={pedidoSeleccionado.costo_envio === 0 ? 'text-green-600 font-medium' : ''}>
          {pedidoSeleccionado.costo_envio > 0 ? 
            `$${pedidoSeleccionado.costo_envio.toLocaleString()}` : 'GRATIS'}
        </span>
      </div>
      
      {/* Total final */}
      <div className="flex justify-between text-lg font-bold pt-2 border-t border-blue-300">
        <span>Total pagado:</span>
        <span className="text-blue-600">
          ${pedidoSeleccionado.total?.toLocaleString()}
        </span>
      </div>
    </div>
  </div>
</div>
                  </div>

                  {/* Resumen de Productos */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      📦 Productos ({pedidoSeleccionado.productos?.length || 0})
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
                      {pedidoSeleccionado.productos?.slice(0, 3).map((producto, index) => (
                        <div key={index} className="p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{producto.nombre}</p>
                            <p className="text-sm text-gray-500">Cantidad: {producto.cantidad}</p>
                          </div>
                          <span className="font-medium text-gray-900">
                            ${((producto.precio || 0) * (producto.cantidad || 0)).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {pedidoSeleccionado.productos?.length > 3 && (
                        <div className="p-3 text-center text-sm text-gray-500">
                          y {pedidoSeleccionado.productos.length - 3} productos más...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Cliente */}
              {activeTab === 'cliente' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Información del cliente</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Nombre</label>
                        <p className="text-gray-900">{pedidoSeleccionado.usuario?.nombre}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900">{pedidoSeleccionado.usuario?.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Teléfono</label>
                        <p className="text-gray-900">{pedidoSeleccionado.telefono_contacto}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Dirección completa</label>
                        <p className="text-gray-900">
                          Torre {pedidoSeleccionado.torre_entrega}, Piso {pedidoSeleccionado.piso_entrega}, Apartamento {pedidoSeleccionado.apartamento_entrega}
                        </p>
                      </div>
                      {pedidoSeleccionado.instrucciones_entrega && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Instrucciones de entrega</label>
                          <p className="text-gray-900">{pedidoSeleccionado.instrucciones_entrega}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Productos */}
              {activeTab === 'productos' && (
                <div className="space-y-4">
                  {pedidoSeleccionado.productos?.map((producto, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
                          {producto.codigo && (
                            <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {producto.codigo}
                            </span>
                          )}
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Cantidad: {producto.cantidad}</p>
                            <p>Precio unitario: ${producto.precio?.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">
                            ${((producto.precio || 0) * (producto.cantidad || 0)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Pago */}
              {activeTab === 'pago' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      {getMetodoPagoIcon(pedidoSeleccionado)} Información de pago
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Método de pago</label>
                        <p className="text-gray-900">{getMetodoPago(pedidoSeleccionado)}</p>
                      </div>
                      
                      {pedidoSeleccionado.payment_status && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Estado del pago</label>
                          <div className="mt-1">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                              pedidoSeleccionado.payment_status === 'APPROVED' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {pedidoSeleccionado.payment_status}
                            </span>
                          </div>
                        </div>
                      )}

                      {pedidoSeleccionado.payment_reference && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Referencia de pago</label>
                          <p className="text-gray-900 font-mono text-sm bg-white px-3 py-2 rounded border">
                            {pedidoSeleccionado.payment_reference}
                          </p>
                        </div>
                      )}

                      {getMetodoPago(pedidoSeleccionado) === 'Efectivo' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">💵</span>
                            <span className="text-green-800 font-medium">Pago en efectivo al recibir</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}