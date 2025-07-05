import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import { toast } from 'react-hot-toast';
import CopyButton from './CopyButton';
import SupercasaLogo from './SupercasaLogo';

export default function HistorialPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 🌙 MODO OSCURO (consistente con el proyecto)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    obtenerMisPedidos();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const obtenerMisPedidos = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Debes iniciar sesión para ver tu historial');
        window.location.href = '/';
        return;
      }

      console.log('🔑 Obteniendo pedidos con token:', !!token);
      
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Respuesta del servidor:', response.status);

      if (response.status === 403) {
        console.log('🔒 Token expirado o inválido');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Tu sesión expiró. Por favor inicia sesión nuevamente.');
        window.location.href = '/';
        return;
      }

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
      case 'pendiente': 
      case 'pendiente_efectivo':
        return darkMode 
          ? 'bg-yellow-900 text-yellow-300 border-yellow-700' 
          : 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'entregado': 
        return darkMode 
          ? 'bg-green-900 text-green-300 border-green-700' 
          : 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado': 
        return darkMode 
          ? 'bg-red-900 text-red-300 border-red-700' 
          : 'bg-red-100 text-red-800 border-red-200';
      default: 
        return darkMode 
          ? 'bg-gray-700 text-gray-300 border-gray-600' 
          : 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente': 
      case 'pendiente_efectivo': 
        return '⏳';
      case 'entregado': return '✅';
      case 'cancelado': return '❌';
      default: return '📦';
    }
  };

  // ✅ MAPEO CORREGIDO DE MÉTODOS DE PAGO - INCLUYENDO DAVIPLATA
  const getPaymentMethodDisplay = (paymentMethod) => {
    switch (paymentMethod?.toUpperCase()) {
      case 'NEQUI': return '📱 Nequi';
      case 'DAVIPLATA': return '🏦 DaviPlata'; // ✅ CORREGIDO
      case 'PSE': return '🏛️ PSE';
      case 'CARD': return '💳 Tarjeta';
      case 'EFECTIVO': return '💵 Efectivo';
      default: return '💵 Efectivo'; // Default para casos sin método especificado
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
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100'
      }`}>
        <div className="text-center">
          <SupercasaLogo 
            size="large"
            showText={true}
            showSlogan={false}
            darkMode={darkMode}
            className="mb-6 animate-pulse"
          />
          <div className={`animate-spin rounded-full h-16 w-16 border-b-2 mx-auto ${
            darkMode ? 'border-amber-400' : 'border-amber-600'
          }`}></div>
          <p className={`mt-4 text-lg transition-colors duration-300 ${
            darkMode ? 'text-amber-300' : 'text-amber-800'
          }`}>Cargando tu historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 p-3 sm:p-6 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100'
    }`}>
      <div className="max-w-6xl mx-auto">
        {/* Header con branding SuperCasa */}
        <div className={`rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-300 border-2 ${
          darkMode 
            ? 'bg-gray-800 border-amber-600' 
            : 'bg-white border-amber-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <SupercasaLogo 
                size="medium"
                showText={true}
                showSlogan={false}
                darkMode={darkMode}
                className="transition-all duration-300 hover:scale-105"
              />
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  📋 Mi Historial de Pedidos
                </h1>
                <p className={`transition-colors duration-300 ${
                  darkMode ? 'text-amber-300' : 'text-amber-600'
                }`}>
                  {pedidosFiltrados.length} pedidos encontrados
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
              {/* Toggle modo oscuro */}
              <button
                onClick={toggleDarkMode}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  darkMode 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-800 text-yellow-400'
                }`}
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                  </svg>
                )}
              </button>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={`px-3 sm:px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 text-sm transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-700 border-amber-600 text-white focus:border-transparent' 
                    : 'bg-white border-amber-200 text-gray-900 focus:border-transparent'
                }`}
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="entregado">Entregados</option>
                <option value="cancelado">Cancelados</option>
              </select>
              
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-4 py-2 rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all text-sm shadow-lg transform hover:scale-105"
              >
                🏗️ Volver a Supercasa
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas con branding SuperCasa */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className={`rounded-xl shadow-lg p-3 sm:p-4 transition-colors duration-300 border-2 ${
            darkMode 
              ? 'bg-gray-800 border-amber-600' 
              : 'bg-white border-amber-200'
          }`}>
            <div className="text-center">
              <div className="text-amber-500 text-xl sm:text-2xl font-bold">
                {pedidos.length}
              </div>
              <div className={`text-xs sm:text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Pedidos</div>
            </div>
          </div>
          
          <div className={`rounded-xl shadow-lg p-3 sm:p-4 transition-colors duration-300 border-2 ${
            darkMode 
              ? 'bg-gray-800 border-green-600' 
              : 'bg-white border-green-200'
          }`}>
            <div className="text-center">
              <div className="text-green-500 text-xl sm:text-2xl font-bold">
                {pedidos.filter(p => p.estado?.toLowerCase() === 'entregado').length}
              </div>
              <div className={`text-xs sm:text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Entregados</div>
            </div>
          </div>
          
          <div className={`rounded-xl shadow-lg p-3 sm:p-4 transition-colors duration-300 border-2 ${
            darkMode 
              ? 'bg-gray-800 border-yellow-600' 
              : 'bg-white border-yellow-200'
          }`}>
            <div className="text-center">
              <div className="text-yellow-500 text-xl sm:text-2xl font-bold">
                {pedidos.filter(p => p.estado?.toLowerCase() === 'pendiente' || p.estado?.toLowerCase() === 'pendiente_efectivo').length}
              </div>
              <div className={`text-xs sm:text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Pendientes</div>
            </div>
          </div>
          
          <div className={`rounded-xl shadow-lg p-3 sm:p-4 transition-colors duration-300 border-2 ${
            darkMode 
              ? 'bg-gray-800 border-amber-600' 
              : 'bg-white border-amber-200'
          }`}>
            <div className="text-center">
              <div className="text-amber-500 text-xl sm:text-2xl font-bold">
                ${pedidos.reduce((acc, p) => acc + (p.total || 0), 0).toLocaleString()}
              </div>
              <div className={`text-xs sm:text-sm transition-colors duration-300 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Total Gastado</div>
            </div>
          </div>
        </div>

        {/* Lista de pedidos */}
        {pedidosFiltrados.length === 0 ? (
          <div className={`rounded-2xl shadow-lg p-8 sm:p-12 text-center transition-colors duration-300 border-2 ${
            darkMode 
              ? 'bg-gray-800 border-amber-600' 
              : 'bg-white border-amber-300'
          }`}>
            <div className={`text-4xl sm:text-6xl mb-4 transition-colors duration-300 ${
              darkMode ? 'text-gray-600' : 'text-amber-400'
            }`}>🏗️</div>
            <h3 className={`text-lg sm:text-xl font-semibold mb-2 transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {filtroEstado === 'todos' ? 'No tienes pedidos aún en SuperCasa' : `No tienes pedidos ${filtroEstado}s`}
            </h3>
            <p className={`text-sm sm:text-base mb-4 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {filtroEstado === 'todos' 
                ? '¡Haz tu primer pedido y aparecerá aquí!' 
                : `Cambia el filtro para ver otros pedidos`}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all shadow-lg transform hover:scale-105"
            >
              🏗️ Ir a Supercasa
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidosFiltrados.map((pedido) => (
              <div key={pedido.id} className={`rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border-2 ${
                darkMode 
                  ? 'bg-gray-800 border-amber-600/50 hover:border-amber-500' 
                  : 'bg-white border-amber-200 hover:border-amber-400'
              }`}>
                <div className="p-4 sm:p-6">
                  {/* Header del pedido */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getEstadoIcon(pedido.estado)}</div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <h3 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            Pedido {formatearNumeroPedido(pedido.id)}
                          </h3>
                          <CopyButton 
                            text={formatearNumeroPedido(pedido.id)}
                            size="sm"
                          />
                        </div>
                        <p className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {formatearFecha(pedido.fecha)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getEstadoColor(pedido.estado)}`}>
                        {pedido.estado}
                      </span>
                      <div className="text-right">
                        <div className="text-lg sm:text-xl font-bold text-amber-500">
                          ${pedido.total?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información del pedido */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className={`rounded-xl p-3 transition-colors duration-300 ${
                      darkMode ? 'bg-gray-700' : 'bg-amber-50'
                    }`}>
                      <div className={`text-xs font-medium mb-1 transition-colors duration-300 ${
                        darkMode ? 'text-amber-400' : 'text-amber-600'
                      }`}>PRODUCTOS</div>
                      <div className={`text-sm font-medium transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {pedido.productos?.length || 0} productos
                      </div>
                    </div>
                    
                    <div className={`rounded-xl p-3 transition-colors duration-300 ${
                      darkMode ? 'bg-gray-700' : 'bg-amber-50'
                    }`}>
                      <div className={`text-xs font-medium mb-1 transition-colors duration-300 ${
                        darkMode ? 'text-amber-400' : 'text-amber-600'
                      }`}>ENTREGA</div>
                      <div className={`text-sm font-medium transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        🏗️ Torre {pedido.torre_entrega} - Piso {pedido.piso_entrega}
                      </div>
                      <div className={`text-xs transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Apt {pedido.apartamento_entrega}
                      </div>
                    </div>
                    
                    <div className={`rounded-xl p-3 transition-colors duration-300 ${
                      darkMode ? 'bg-gray-700' : 'bg-amber-50'
                    }`}>
                      <div className={`text-xs font-medium mb-1 transition-colors duration-300 ${
                        darkMode ? 'text-amber-400' : 'text-amber-600'
                      }`}>MÉTODO DE PAGO</div>
                      <div className={`text-sm font-medium transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {getPaymentMethodDisplay(pedido.payment_method)}
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <a
                      href={`/?openChat=true&mensaje=${formatearNumeroPedido(pedido.id)}&autoFocus=true`}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm font-medium inline-block text-center no-underline shadow-lg transform hover:scale-105"
                    >
                      💬 Consultar en Chat
                    </a>
                    
                    <button
                      onClick={() => {
                        setPedidoSeleccionado(pedido);
                        setShowModal(true);
                      }}
                      className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all text-sm shadow-lg transform hover:scale-105"
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
          <div className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto transition-colors duration-300 border-2 ${
            darkMode 
              ? 'bg-gray-800 border-amber-600' 
              : 'bg-white border-amber-300'
          }`}>
            <div className={`p-4 sm:p-6 border-b transition-colors duration-300 ${
              darkMode ? 'border-amber-600' : 'border-amber-300'
            }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <SupercasaLogo 
                    size="small"
                    showText={false}
                    showSlogan={false}
                    darkMode={darkMode}
                  />
                  <h2 className={`text-lg sm:text-2xl font-bold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Detalles del Pedido {formatearNumeroPedido(pedidoSeleccionado.id)}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className={`p-1 transition-colors duration-300 ${
                    darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {/* Estado y fechas */}
              <div className={`rounded-xl p-4 mb-6 transition-colors duration-300 ${
                darkMode ? 'bg-gray-700' : 'bg-amber-50'
              }`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                      darkMode ? 'text-amber-400' : 'text-amber-600'
                    }`}>ESTADO ACTUAL</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getEstadoIcon(pedidoSeleccionado.estado)}</span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getEstadoColor(pedidoSeleccionado.estado)}`}>
                        {pedidoSeleccionado.estado}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                      darkMode ? 'text-amber-400' : 'text-amber-600'
                    }`}>FECHAS</div>
                    <div className="space-y-1">
                      <div className={`text-sm transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <span className="font-medium">Pedido:</span> {formatearFecha(pedidoSeleccionado.fecha)}
                      </div>
                      {pedidoSeleccionado.fecha_entrega && (
                        <div className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <span className="font-medium">Entregado:</span> {formatearFecha(pedidoSeleccionado.fecha_entrega)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="mb-6">
                <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  📦 Productos ({pedidoSeleccionado.productos?.length || 0})
                </h3>
                <div className="space-y-3">
                  {pedidoSeleccionado.productos?.map((producto, index) => (
                    <div key={index} className={`rounded-xl p-4 flex justify-between items-center transition-colors duration-300 ${
                      darkMode ? 'bg-gray-700' : 'bg-amber-50'
                    }`}>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          {producto.codigo && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-mono border transition-colors duration-300 ${
                              darkMode 
                                ? 'bg-amber-900 text-amber-300 border-amber-700' 
                                : 'bg-amber-100 text-amber-800 border-amber-200'
                            }`}>
                              📋 {producto.codigo}
                            </span>
                          )}
                          <h4 className={`font-medium transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-800'
                          }`}>{producto.nombre}</h4>
                        </div>
                        <div className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <span>Cantidad: {producto.cantidad}</span>
                          <span className="mx-2">•</span>
                          <span>Precio unitario: ${producto.precio?.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-bold text-amber-500">
                          ${((producto.precio || 0) * (producto.cantidad || 0)).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className={`rounded-xl p-4 border-2 transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gradient-to-r from-gray-700 to-gray-600 border-amber-600' 
                  : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>Total del Pedido SuperCasa:</span>
                  <span className="text-xl sm:text-2xl font-bold text-amber-500">
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