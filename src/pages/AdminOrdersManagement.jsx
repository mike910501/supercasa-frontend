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
  const [tiempoActual, setTiempoActual] = useState(new Date()); // Para actualizar el tiempo relativo

  // Función para determinar método de pago basado en payment_reference
  const getMetodoPago = (pedido) => {
    if (pedido.payment_reference && pedido.payment_reference !== null) {
      return 'WOMPI';
    } else {
      return 'Efectivo';
    }
  };

  const getMetodoPagoIcon = (pedido) => {
    const metodo = getMetodoPago(pedido);
    switch (metodo) {
      case 'WOMPI': return '💳';
      case 'Efectivo': return '💵';
      default: return '❓';
    }
  };

  // Actualizar tiempo cada segundo para mostrar tiempo relativo dinámico
  useEffect(() => {
    const timer = setInterval(() => {
      setTiempoActual(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cargar pedidos al montar el componente y configurar auto-actualización
  useEffect(() => {
    obtenerPedidos(true); // Primera carga
    
    // Intervalo más inteligente: más frecuente si hay pedidos pendientes
    const getInterval = () => {
      const pendientes = pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'Pendiente').length;
      return pendientes > 0 ? 10000 : 15000; // 10 seg si hay pendientes, 15 seg si no
    };
    
    // Configurar auto-actualización
    const interval = setInterval(() => {
      if (autoUpdate && !showModal) { // No actualizar si hay modal abierto
        obtenerPedidos(false); // Actualización silenciosa
      }
    }, getInterval());

    return () => clearInterval(interval);
  }, [autoUpdate, showModal, pedidos.length]);

  // Función para formatear tiempo relativo
  const formatearTiempoActualizacion = (fecha) => {
    const diff = Math.floor((tiempoActual - fecha) / 1000); // segundos
    
    if (diff < 60) {
      return `hace ${diff}s`;
    } else if (diff < 3600) {
      return `hace ${Math.floor(diff / 60)}m`;
    } else {
      return fecha.toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  // Función para obtener pedidos
  const obtenerPedidos = async (initialLoad = false) => {
    if (initialLoad) {
      setIsLoading(true);
    } else {
      setIsUpdating(true);
    }
    
    try {
      const nuevosPedidos = await api.get('/api/admin/pedidos', navigate);
      
      // Detectar nuevos pedidos (solo si no es la carga inicial)
      if (!initialLoad && pedidos.length > 0) {
        const nuevosIds = nuevosPedidos.map(p => p.id);
        const viejosIds = pedidos.map(p => p.id);
        const pedidosNuevos = nuevosIds.filter(id => !viejosIds.includes(id));
        
        if (pedidosNuevos.length > 0) {
          toast.success(`¡${pedidosNuevos.length} nuevo${pedidosNuevos.length > 1 ? 's' : ''} pedido${pedidosNuevos.length > 1 ? 's' : ''}!`, {
            icon: '🆕',
            duration: 4000,
          });
        }
      }
      
      if (initialLoad) {
        console.log("✅ Pedidos cargados correctamente:", nuevosPedidos.length, "pedidos");
      } else {
        console.log("🔄 Actualización automática:", nuevosPedidos.length, "pedidos");
      }
      
      setPedidos(nuevosPedidos);
      setUltimaActualizacion(new Date());
    } catch (error) {
      if (initialLoad) {
        toast.error(error.message);
      } else {
        console.error("Error en actualización automática:", error);
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
    const matchesMetodoPago = filtroMetodoPago === 'todos' || getMetodoPago(pedido) === filtroMetodoPago;
    return matchesEstado && matchesTorre && matchesMetodoPago;
  });

  // Función para cambiar estado de pedido
  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      console.log('🔄 Cambiando estado del pedido:', pedidoId, 'a:', nuevoEstado);
      
      await api.put(`/api/admin/pedidos/${pedidoId}/estado`, { estado: nuevoEstado }, navigate);
      
      console.log('✅ Pedido actualizado correctamente');
      toast.success(`Pedido ${nuevoEstado === 'entregado' ? 'marcado como entregado' : 'actualizado'} correctamente`);
      
      // Actualizar el estado local
      setPedidos(pedidos.map(pedido => 
        pedido.id === pedidoId 
          ? { 
              ...pedido, 
              estado: nuevoEstado,
              fecha_entrega: nuevoEstado === 'entregado' ? new Date().toISOString() : null
            }
          : pedido
      ));
      
      // Actualizar pedido seleccionado si es el mismo
      if (pedidoSeleccionado && pedidoSeleccionado.id === pedidoId) {
        setPedidoSeleccionado({
          ...pedidoSeleccionado,
          estado: nuevoEstado,
          fecha_entrega: nuevoEstado === 'entregado' ? new Date().toISOString() : null
        });
      }

    } catch (error) {
      console.error('❌ Error al actualizar pedido:', error);
      toast.error(`Error al actualizar el pedido: ${error.message}`);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return 'Fecha inválida';
    }
    
    return fechaObj.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularTiempoTranscurrido = (fecha) => {
    if (!fecha) return 'Sin fecha';
    
    const ahora = new Date();
    const fechaPedido = new Date(fecha);
    
    if (isNaN(fechaPedido.getTime())) {
      return 'Fecha inválida';
    }
    
    const diffMinutos = Math.floor((ahora - fechaPedido) / (1000 * 60));
    
    if (diffMinutos < 60) {
      return `${diffMinutos} min`;
    } else if (diffMinutos < 1440) {
      return `${Math.floor(diffMinutos / 60)}h ${diffMinutos % 60}m`;
    } else {
      return `${Math.floor(diffMinutos / 1440)} días`;
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': 
      case 'Pendiente': return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'entregado': 
      case 'Entregado': return 'bg-green-900 text-green-300 border-green-700';
      case 'cancelado': 
      case 'Cancelado': return 'bg-red-900 text-red-300 border-red-700';
      default: return 'bg-gray-800 text-gray-300 border-gray-600';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-900 text-green-300 border-green-700';
      case 'PENDING': return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'DECLINED': return 'bg-red-900 text-red-300 border-red-700';
      default: return 'bg-gray-800 text-gray-300 border-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300 text-lg">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                📦 Gestión de Entregas
                {isUpdating && (
                  <span className="ml-2 inline-flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  </span>
                )}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-400 mt-1">
                <span>{pedidosFiltrados.length} pedidos encontrados</span>
                <span className="hidden sm:block">•</span>
                <span className="text-xs">
                  Última actualización: {formatearTiempoActualizacion(ultimaActualizacion)}
                </span>
                {autoUpdate && (
                  <>
                    <span className="hidden sm:block">•</span>
                    <span className="text-xs text-green-400">
                      🔄 Auto-actualización activa
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm text-gray-200"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="entregado">Entregados</option>
                <option value="cancelado">Cancelados</option>
              </select>
              
              <select
                value={filtroTorre}
                onChange={(e) => setFiltroTorre(e.target.value)}
                className="px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm text-gray-200"
              >
                <option value="">Todas las torres</option>
                <option value="1">Torre 1</option>
                <option value="2">Torre 2</option>
                <option value="3">Torre 3</option>
                <option value="4">Torre 4</option>
                <option value="5">Torre 5</option>
              </select>

              <select
                value={filtroMetodoPago}
                onChange={(e) => setFiltroMetodoPago(e.target.value)}
                className="px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm text-gray-200"
              >
                <option value="todos">Todos los métodos</option>
                <option value="Efectivo">💵 Efectivo</option>
                <option value="WOMPI">💳 WOMPI</option>
              </select>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setAutoUpdate(!autoUpdate)}
                  className={`px-3 py-2 rounded-xl transition-colors text-sm ${
                    autoUpdate 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-gray-200'
                  }`}
                >
                  {autoUpdate ? '⏸️ Pausar' : '▶️ Auto-actualizar'}
                </button>
                
                <button
                  onClick={() => obtenerPedidos(false)}
                  disabled={isLoading || isUpdating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors text-sm flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Actualizando...
                    </>
                  ) : (
                    <>🔄 Actualizar ahora</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center">
              <div className="bg-yellow-900 text-yellow-400 p-2 sm:p-3 rounded-xl">
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-lg sm:text-2xl font-bold text-gray-200">
                  {pedidos.filter(p => p.estado === 'Pendiente' || p.estado === 'pendiente').length}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">Pendientes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center">
              <div className="bg-green-900 text-green-400 p-2 sm:p-3 rounded-xl">
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-lg sm:text-2xl font-bold text-gray-200">
                  {pedidos.filter(p => p.estado === 'entregado').length}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">Entregados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center">
              <div className="bg-blue-900 text-blue-400 p-2 sm:p-3 rounded-xl">
                💵
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-lg sm:text-2xl font-bold text-gray-200">
                  {pedidos.filter(p => getMetodoPago(p) === 'Efectivo').length}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">Efectivo</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center">
              <div className="bg-purple-900 text-purple-400 p-2 sm:p-3 rounded-xl">
                💳
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-lg sm:text-2xl font-bold text-gray-200">
                  {pedidos.filter(p => getMetodoPago(p) === 'WOMPI').length}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">WOMPI</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="flex items-center">
              <div className="bg-emerald-900 text-emerald-400 p-2 sm:p-3 rounded-xl">
                <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-sm sm:text-2xl font-bold text-gray-200">
                  ${pedidos.reduce((acc, p) => acc + (p.total || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">Total vendido</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de pedidos - Responsive */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl overflow-hidden">
          {/* Vista móvil - Cards */}
          <div className="block lg:hidden">
            <div className="p-4 space-y-4">
              {pedidosFiltrados.map((pedido) => (
                <div key={pedido.id} className="bg-gray-700 border border-gray-600 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-200">Pedido #{pedido.id}</p>
                      <p className="text-sm text-gray-400">{pedido.productos?.length || 0} productos</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg">{getMetodoPagoIcon(pedido)}</span>
                        <span className="text-sm text-gray-300">{getMetodoPago(pedido)}</span>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-300"><span className="font-medium">Cliente:</span> {pedido.usuario?.nombre}</p>
                    <p className="text-sm text-gray-300"><span className="font-medium">Entrega:</span> Torre {pedido.torre_entrega} - Piso {pedido.piso_entrega} - Apt {pedido.apartamento_entrega}</p>
                    <p className="text-sm text-gray-300"><span className="font-medium">Total:</span> <span className="font-bold text-blue-400">${pedido.total?.toLocaleString() || '0'}</span></p>
                    <p className="text-sm text-gray-300"><span className="font-medium">Hace:</span> {calcularTiempoTranscurrido(pedido.fecha_pedido)}</p>
                    {pedido.payment_reference && (
                      <p className="text-sm text-gray-300"><span className="font-medium">Ref:</span> {pedido.payment_reference}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => {
                        setPedidoSeleccionado(pedido);
                        setShowModal(true);
                      }}
                      className="w-full text-blue-400 hover:text-blue-300 bg-blue-900 hover:bg-blue-800 border border-blue-700 px-3 py-2 rounded-lg transition-colors text-sm"
                    >
                      Ver Detalles
                    </button>
                    {(pedido.estado === 'Pendiente' || pedido.estado === 'pendiente') && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => cambiarEstadoPedido(pedido.id, 'entregado')}
                          className="flex-1 text-green-300 hover:text-green-200 bg-green-900 hover:bg-green-800 border border-green-700 px-3 py-2 rounded-lg transition-colors text-sm"
                        >
                          ✓ Entregado
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Cancelar este pedido? El stock se restaurará automáticamente.`)) {
                              cambiarEstadoPedido(pedido.id, 'cancelado');
                            }
                          }}
                          className="flex-1 text-red-300 hover:text-red-200 bg-red-900 hover:bg-red-800 border border-red-700 px-3 py-2 rounded-lg transition-colors text-sm"
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700 border-b border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Método Pago
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tiempo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-200">
                        #{pedido.id}
                      </div>
                      <div className="text-sm text-gray-400">
                        {pedido.productos?.length || 0} productos
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-200">
                        {pedido.usuario?.nombre}
                      </div>
                      <div className="text-sm text-gray-400">
                        {pedido.telefono_contacto}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getMetodoPagoIcon(pedido)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-200">{getMetodoPago(pedido)}</div>
                          {pedido.payment_method && (
                            <div className="text-xs text-gray-400">{pedido.payment_method}</div>
                          )}
                          {pedido.payment_status && (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPaymentStatusColor(pedido.payment_status)}`}>
                              {pedido.payment_status}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-200">
                        Torre {pedido.torre_entrega} - Piso {pedido.piso_entrega}
                      </div>
                      <div className="text-sm text-gray-400">
                        Apt {pedido.apartamento_entrega}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                      ${pedido.total?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(pedido.estado)}`}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{calcularTiempoTranscurrido(pedido.fecha_pedido)}</div>
                      <div className="text-xs text-gray-400">{formatearFecha(pedido.fecha_pedido)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setPedidoSeleccionado(pedido);
                          setShowModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 bg-blue-900 hover:bg-blue-800 border border-blue-700 px-3 py-1 rounded-lg transition-colors"
                      >
                        Ver Detalles
                      </button>
                      {(pedido.estado === 'Pendiente' || pedido.estado === 'pendiente') && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => cambiarEstadoPedido(pedido.id, 'entregado')}
                            className="text-green-300 hover:text-green-200 bg-green-900 hover:bg-green-800 border border-green-700 px-3 py-1 rounded-lg transition-colors"
                          >
                            ✓ Entregado
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Cancelar este pedido? El stock se restaurará automáticamente.`)) {
                                cambiarEstadoPedido(pedido.id, 'cancelado');
                              }
                            }}
                            className="text-red-300 hover:text-red-200 bg-red-900 hover:bg-red-800 border border-red-700 px-3 py-1 rounded-lg transition-colors"
                          >
                            ❌ Cancelar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {pedidosFiltrados.length === 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <div className="text-gray-500 text-4xl sm:text-6xl mb-4">📦</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-300 mb-2">No hay pedidos</h3>
            <p className="text-gray-400 text-sm sm:text-base">No se encontraron pedidos con los filtros seleccionados</p>
          </div>
        )}
      </div>

      {/* Modal de detalles del pedido */}
      {showModal && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-2xl font-bold text-gray-200">
                  Detalles del Pedido #{pedidoSeleccionado.id}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-200 p-1"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Información del cliente */}
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-3 sm:mb-4 flex items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                      Información del Cliente
                    </h3>
                    <div className="bg-gray-700 border border-gray-600 rounded-xl p-3 sm:p-4 space-y-2">
                      <p className="text-sm sm:text-base text-gray-300"><span className="font-medium">Nombre:</span> {pedidoSeleccionado.usuario?.nombre}</p>
                      <p className="text-sm sm:text-base text-gray-300"><span className="font-medium">Email:</span> {pedidoSeleccionado.usuario?.email}</p>
                      <p className="text-sm sm:text-base text-gray-300"><span className="font-medium">Teléfono:</span> {pedidoSeleccionado.telefono_contacto}</p>
                    </div>
                  </div>

                  {/* Información de Pago */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-3 sm:mb-4 flex items-center">
                      <span className="text-lg mr-2">{getMetodoPagoIcon(pedidoSeleccionado)}</span>
                      Información de Pago
                    </h3>
                    <div className="bg-gray-700 border border-gray-600 rounded-xl p-3 sm:p-4 space-y-2">
                      <p className="text-sm sm:text-base text-gray-300">
                        <span className="font-medium">Método:</span> {getMetodoPago(pedidoSeleccionado)}
                      </p>
                      {pedidoSeleccionado.payment_method && (
                        <p className="text-sm sm:text-base text-gray-300">
                          <span className="font-medium">Tipo:</span> {pedidoSeleccionado.payment_method}
                        </p>
                      )}
                      {pedidoSeleccionado.payment_status && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-300">Estado:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPaymentStatusColor(pedidoSeleccionado.payment_status)}`}>
                            {pedidoSeleccionado.payment_status}
                          </span>
                        </div>
                      )}
                      {pedidoSeleccionado.payment_reference && (
                        <p className="text-sm sm:text-base text-gray-300">
                          <span className="font-medium">Referencia:</span> 
                          <span className="font-mono text-xs ml-2 bg-gray-600 px-2 py-1 rounded">
                            {pedidoSeleccionado.payment_reference}
                          </span>
                        </p>
                      )}
                      {pedidoSeleccionado.payment_transaction_id && (
                        <p className="text-sm sm:text-base text-gray-300">
                          <span className="font-medium">ID Transacción:</span> 
                          <span className="font-mono text-xs ml-2 bg-gray-600 px-2 py-1 rounded">
                            {pedidoSeleccionado.payment_transaction_id}
                          </span>
                        </p>
                      )}
                      {getMetodoPago(pedidoSeleccionado) === 'Efectivo' && (
                        <div className="bg-green-900 border border-green-700 rounded-lg p-3 mt-3">
                          <div className="flex items-center">
                            <span className="text-green-400 text-lg mr-2">💵</span>
                            <span className="text-green-300 font-medium text-sm sm:text-base">Pago en efectivo al recibir</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-3 sm:mb-4 flex items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                      Dirección de Entrega
                    </h3>
                    <div className="bg-gray-700 border border-gray-600 rounded-xl p-3 sm:p-4 space-y-2">
                      <p className="text-sm sm:text-base text-gray-300"><span className="font-medium">Torre:</span> {pedidoSeleccionado.torre_entrega}</p>
                      <p className="text-sm sm:text-base text-gray-300"><span className="font-medium">Piso:</span> {pedidoSeleccionado.piso_entrega}</p>
                      <p className="text-sm sm:text-base text-gray-300"><span className="font-medium">Apartamento:</span> {pedidoSeleccionado.apartamento_entrega}</p>
                      <div className="bg-blue-900 border border-blue-700 rounded-lg p-3 mt-3">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-blue-300 font-medium text-sm sm:text-base">⚡ Entrega rápida: máximo 20 minutos</span>
                        </div>
                      </div>
                      {pedidoSeleccionado.instrucciones_entrega && (
                        <p className="text-sm sm:text-base text-gray-300"><span className="font-medium">Instrucciones:</span> {pedidoSeleccionado.instrucciones_entrega}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-3 sm:mb-4 flex items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                      </svg>
                      Estado del Pedido
                    </h3>
                    <div className="bg-gray-700 border border-gray-600 rounded-xl p-3 sm:p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getEstadoColor(pedidoSeleccionado.estado)}`}>
                          {pedidoSeleccionado.estado}
                        </span>
                        {(pedidoSeleccionado.estado === 'Pendiente' || pedidoSeleccionado.estado === 'pendiente') && (
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                            <button
                              onClick={() => cambiarEstadoPedido(pedidoSeleccionado.id, 'entregado')}
                              className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              ✓ Marcar como Entregado
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Cancelar este pedido?\n\nEl stock se restaurará automáticamente.`)) {
                                  cambiarEstadoPedido(pedidoSeleccionado.id, 'cancelado');
                                  setShowModal(false);
                                }
                              }}
                              className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              ❌ Cancelar Pedido
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-gray-300"><span className="font-medium">Fecha del pedido:</span> {formatearFecha(pedidoSeleccionado.fecha_pedido)}</p>
                      <p className="text-sm sm:text-base text-gray-300"><span className="font-medium">Hace:</span> {calcularTiempoTranscurrido(pedidoSeleccionado.fecha_pedido)}</p>
                      {pedidoSeleccionado.fecha_entrega && (
                        <p className="text-sm sm:text-base text-gray-300"><span className="font-medium">Fecha de entrega:</span> {formatearFecha(pedidoSeleccionado.fecha_entrega)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Productos del pedido */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-200 mb-3 sm:mb-4 flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM8 15v-3a1 1 0 011-1h2a1 1 0 011 1v3h-4z" clipRule="evenodd"/>
                    </svg>
                    Productos ({pedidoSeleccionado.productos?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {pedidoSeleccionado.productos?.map((producto, index) => (
                      <div key={index} className="bg-gray-700 border border-gray-600 rounded-xl p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              {producto.codigo && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono bg-blue-900 text-blue-300 border border-blue-700">
                                  📋 {producto.codigo}
                                </span>
                              )}
                              <h4 className="font-medium text-gray-200 text-sm sm:text-base">{producto.nombre}</h4>
                            </div>
                            <div className="space-y-1 text-xs sm:text-sm text-gray-400">
                              <p><span className="font-medium">Cantidad:</span> {producto.cantidad}</p>
                              <p><span className="font-medium">Precio unitario:</span> ${producto.precio?.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right mt-2 sm:mt-0">
                            <p className="font-bold text-blue-400 text-sm sm:text-base">
                              ${((producto.precio || 0) * (producto.cantidad || 0)).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 sm:mt-6 bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg sm:text-xl font-bold text-gray-200">Total del Pedido:</span>
                      <span className="text-xl sm:text-2xl font-bold text-blue-400">
                        ${pedidoSeleccionado.total?.toLocaleString() || '0'}
                      </span>
                    </div>
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