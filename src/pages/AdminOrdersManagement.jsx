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
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [tiempoActual, setTiempoActual] = useState(new Date());
  const [activeTab, setActiveTab] = useState('resumen');

  // Funciones auxiliares
  const getMetodoPago = (pedido) => {
    return pedido.payment_reference ? 'Digital' : 'Efectivo';
  };

  const getMetodoPagoIcon = (pedido) => {
    return pedido.payment_reference ? '💳' : '💵';
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

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    const matchesEstado = filtroEstado === 'todos' || pedido.estado === filtroEstado;
    const matchesTorre = filtroTorre === '' || pedido.torre_entrega === filtroTorre;
    return matchesEstado && matchesTorre;
  });

  // Cambiar estado de pedido
  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      await api.put(`/api/admin/pedidos/${pedidoId}/estado`, { estado: nuevoEstado }, navigate);
      
      toast.success(`Pedido ${nuevoEstado === 'entregado' ? 'entregado' : 'actualizado'} ✅`);
      
      setPedidos(pedidos.map(pedido => 
        pedido.id === pedidoId 
          ? { ...pedido, estado: nuevoEstado }
          : pedido
      ));
      
      if (pedidoSeleccionado && pedidoSeleccionado.id === pedidoId) {
        setPedidoSeleccionado({ ...pedidoSeleccionado, estado: nuevoEstado });
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const formatearTiempo = (fecha) => {
    if (!fecha) return '---';
    
    try {
      const ahora = new Date();
      const fechaPedido = new Date(fecha);
      
      if (isNaN(fechaPedido.getTime())) return '---';
      
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
    switch (estado?.toLowerCase()) {
      case 'pendiente': 
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'entregado': 
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado': 
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
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
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
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="todos">Todos</option>
                <option value="Pendiente">Pendientes</option>
                <option value="entregado">Entregados</option>
              </select>
              
              <select
                value={filtroTorre}
                onChange={(e) => setFiltroTorre(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  autoUpdate 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                {autoUpdate ? '⏸️ Auto' : '▶️ Manual'}
              </button>
              
              <button
                onClick={() => obtenerPedidos(false)}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Grid de Cards ESTILO CARRITO */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pedidosFiltrados.map((pedido) => {
            // Calcular subtotal de productos
            const subtotalProductos = pedido.productos?.reduce((acc, p) => 
              acc + (p.precio * p.cantidad), 0) || 0;
            
            return (
              <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                
                {/* Header del pedido */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getMetodoPagoIcon(pedido)}</span>
                      <div>
                        <h3 className="font-bold text-lg">Pedido #{pedido.id}</h3>
                        <p className="text-blue-100 text-sm">{formatearTiempo(pedido.fecha_pedido)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      pedido.estado?.toLowerCase() === 'pendiente' 
                        ? 'bg-orange-400 text-white' 
                        : pedido.estado?.toLowerCase() === 'entregado'
                        ? 'bg-green-400 text-white'
                        : 'bg-gray-400 text-white'
                    }`}>
                      {pedido.estado}
                    </span>
                  </div>
                  
                  {/* Info del cliente */}
                  <div className="border-t border-blue-500 pt-2 mt-2">
                    <p className="font-medium">{pedido.usuario?.nombre}</p>
                    <p className="text-sm text-blue-100">
                      📍 Torre {pedido.torre_entrega} • Piso {pedido.piso_entrega} • Apt {pedido.apartamento_entrega}
                    </p>
                    <p className="text-sm text-blue-100">📱 {pedido.telefono_contacto}</p>
                  </div>
                </div>
                
                {/* Lista de productos */}
                <div className="p-4 max-h-48 overflow-y-auto border-b border-gray-100">
                  {pedido.productos?.map((producto, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{producto.nombre}</p>
                        <p className="text-xs text-gray-500">
                          ${producto.precio?.toLocaleString()} x {producto.cantidad}
                        </p>
                      </div>
                      <span className="font-bold text-gray-800">
                        ${(producto.precio * producto.cantidad).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Desglose de totales */}
<div className="p-4 bg-gray-50 space-y-2">
  {/* Subtotal */}
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">Subtotal productos:</span>
    <span className="font-medium">${subtotalProductos.toLocaleString()}</span>
  </div>
  
  {/* Detectar y mostrar TODOS los descuentos */}
  {(() => {
    let totalDescuentos = 0;
    const descuentosAMostrar = [];
    
    // 1. Descuento por código promocional (guardado o calculado)
    if (pedido.codigo_promocional && pedido.codigo_promocional !== 'null' && pedido.codigo_promocional !== '') {
      const montoDescuentoCodigo = pedido.descuento_monto || 
                                   pedido.descuento_cupon || 
                                   Math.floor(subtotalProductos * 0.1);
      if (montoDescuentoCodigo > 0) {
        descuentosAMostrar.push(
          <div key="codigo" className="flex justify-between text-sm">
            <span className="text-green-600">📱 {pedido.codigo_promocional}:</span>
            <span className="text-green-600 font-medium">
              -${montoDescuentoCodigo.toLocaleString()}
            </span>
          </div>
        );
        totalDescuentos += montoDescuentoCodigo;
      }
    }
    
    // 2. Descuento por canje de puntos
    if (pedido.descuento_canje > 0) {
      descuentosAMostrar.push(
        <div key="canje" className="flex justify-between text-sm">
          <span className="text-purple-600">💎 Canje de puntos:</span>
          <span className="text-purple-600 font-medium">
            -${pedido.descuento_canje.toLocaleString()}
          </span>
        </div>
      );
      totalDescuentos += pedido.descuento_canje;
    }
    
    // 3. Si hay diferencia no explicada, detectar descuento implícito
    const totalEsperado = subtotalProductos - totalDescuentos + (pedido.costo_envio || 0);
    const diferenciaSinExplicar = totalEsperado - pedido.total;
    
    // Si hay más de $500 de diferencia sin explicar
    if (diferenciaSinExplicar > 500) {
      // Verificar si es aproximadamente 10% (código promocional no registrado)
      const esPorcentajeCercano = Math.abs(diferenciaSinExplicar - (subtotalProductos * 0.1)) < 100;
      
      descuentosAMostrar.push(
        <div key="implicito" className="flex justify-between text-sm">
          <span className="text-green-600">
            📱 {esPorcentajeCercano ? 'Descuento 10%' : 'Descuento aplicado'}:
          </span>
          <span className="text-green-600 font-medium">
            -${Math.round(diferenciaSinExplicar).toLocaleString()}
          </span>
        </div>
      );
    }
    
    return descuentosAMostrar;
  })()}
  
  {/* Costo de envío */}
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">Costo de envío:</span>
    <span className={`font-medium ${pedido.costo_envio === 0 ? 'text-green-600' : ''}`}>
      {pedido.costo_envio > 0 ? `$${pedido.costo_envio.toLocaleString()}` : 'GRATIS 🚚'}
    </span>
  </div>
  
  {/* Total */}
  <div className="border-t border-gray-300 pt-2 mt-2">
    <div className="flex justify-between items-center">
      <span className="text-base font-bold text-gray-900">Total Supercasa:</span>
      <span className="text-xl font-bold text-green-600">
        ${pedido.total?.toLocaleString()}
      </span>
    </div>
  </div>
</div>
                
                {/* Acciones */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPedidoSeleccionado(pedido);
                        setActiveTab('resumen');
                        setShowModal(true);
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      📋 Ver detalles
                    </button>
                    
                    {(pedido.estado === 'pendiente' || pedido.estado === 'Pendiente') && (
                      <>
                        <button
                          onClick={() => cambiarEstadoPedido(pedido.id, 'entregado')}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          ✓ Entregado
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('¿Cancelar pedido #' + pedido.id + '?')) {
                              cambiarEstadoPedido(pedido.id, 'cancelado');
                            }
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Método de pago */}
                  <div className="mt-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      pedido.payment_reference 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {getMetodoPagoIcon(pedido)} Pago {getMetodoPago(pedido)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Modal mejorado */}
      {showModal && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    Pedido #{pedidoSeleccionado.id}
                  </h2>
                  <p className="text-blue-100 mt-1">
                    {pedidoSeleccionado.usuario?.nombre} • {formatearTiempo(pedidoSeleccionado.fecha_pedido)}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-white hover:bg-blue-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              
              {/* Estado y acciones */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className={`px-4 py-2 text-sm font-bold rounded-full border-2 ${getEstadoStyle(pedidoSeleccionado.estado)}`}>
                    {pedidoSeleccionado.estado}
                  </span>
                  
                  {(pedidoSeleccionado.estado === 'pendiente' || pedidoSeleccionado.estado === 'Pendiente') && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          cambiarEstadoPedido(pedidoSeleccionado.id, 'entregado');
                          setShowModal(false);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        ✓ Marcar como entregado
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
                        ✕ Cancelar pedido
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid de información */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* Cliente */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    👤 Información del Cliente
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Nombre:</span> <span className="font-medium">{pedidoSeleccionado.usuario?.nombre}</span></p>
                    <p><span className="text-gray-500">Teléfono:</span> <span className="font-medium">{pedidoSeleccionado.telefono_contacto}</span></p>
                    <p><span className="text-gray-500">Email:</span> <span className="font-medium">{pedidoSeleccionado.usuario?.email}</span></p>
                  </div>
                </div>

                {/* Entrega */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    🏠 Dirección de Entrega
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Torre:</span> <span className="font-medium">{pedidoSeleccionado.torre_entrega}</span></p>
                    <p><span className="text-gray-500">Piso:</span> <span className="font-medium">{pedidoSeleccionado.piso_entrega}</span></p>
                    <p><span className="text-gray-500">Apartamento:</span> <span className="font-medium">{pedidoSeleccionado.apartamento_entrega}</span></p>
                    {pedidoSeleccionado.instrucciones_entrega && (
                      <p><span className="text-gray-500">Instrucciones:</span> <span className="font-medium">{pedidoSeleccionado.instrucciones_entrega}</span></p>
                    )}
                  </div>
                </div>
              </div>

              {/* Productos detallados */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  📦 Productos del Pedido
                </h3>
                <div className="space-y-3">
                  {pedidoSeleccionado.productos?.map((producto, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{producto.nombre}</p>
                        <p className="text-sm text-gray-500">
                          ${producto.precio?.toLocaleString()} x {producto.cantidad} unidades
                        </p>
                      </div>
                      <span className="font-bold text-lg text-gray-900">
                        ${((producto.precio || 0) * (producto.cantidad || 0)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen de pago */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">💰 Resumen del Pago</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      ${pedidoSeleccionado.productos?.reduce((acc, p) => 
                        acc + (p.precio * p.cantidad), 0).toLocaleString() || 0}
                    </span>
                  </div>
                  
                  {pedidoSeleccionado.codigo_promocional && pedidoSeleccionado.codigo_promocional !== 'null' && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuento ({pedidoSeleccionado.codigo_promocional}):</span>
                      <span className="font-medium">
                        -${(pedidoSeleccionado.descuento_monto || pedidoSeleccionado.descuento_cupon || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {pedidoSeleccionado.descuento_canje > 0 && (
                    <div className="flex justify-between text-sm text-purple-600">
                      <span>Canje de puntos:</span>
                      <span className="font-medium">-${pedidoSeleccionado.descuento_canje.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span>Envío:</span>
                    <span className={`font-medium ${pedidoSeleccionado.costo_envio === 0 ? 'text-green-600' : ''}`}>
                      {pedidoSeleccionado.costo_envio > 0 ? `$${pedidoSeleccionado.costo_envio.toLocaleString()}` : 'GRATIS 🚚'}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total pagado:</span>
                      <span className="text-green-600 text-xl">
                        ${pedidoSeleccionado.total?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium ${
                      pedidoSeleccionado.payment_reference 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {getMetodoPagoIcon(pedidoSeleccionado)} Pago {getMetodoPago(pedidoSeleccionado)}
                      {pedidoSeleccionado.payment_reference && (
                        <span className="text-xs ml-2">Ref: {pedidoSeleccionado.payment_reference}</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}