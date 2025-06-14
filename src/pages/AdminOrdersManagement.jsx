import React, { useState, useEffect } from 'react';
import API_URL from '../config/api'; // ⚡ AGREGADO: Import de configuración de API

export default function AdminOrdersManagement() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTorre, setFiltroTorre] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Cargar pedidos reales desde tu API
  useEffect(() => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    fetch(`${API_URL}/api/admin/pedidos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Pedidos cargados desde la base de datos:", data);
        setPedidos(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar los pedidos:', error);
        setIsLoading(false);
      });
  }, []);

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    const matchesEstado = filtroEstado === 'todos' || pedido.estado === filtroEstado;
    const matchesTorre = filtroTorre === '' || pedido.torre_entrega === filtroTorre;
    return matchesEstado && matchesTorre;
  });

  // Cambiar estado del pedido usando tu API real
  const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Cambiando estado del pedido:', pedidoId, 'a:', nuevoEstado);
      
      const response = await fetch(`${API_URL}/api/admin/pedidos/${pedidoId}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });

      console.log('📡 Respuesta de la API:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Pedido actualizado:', result);
        
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
        
        if (pedidoSeleccionado && pedidoSeleccionado.id === pedidoId) {
          setPedidoSeleccionado({
            ...pedidoSeleccionado,
            estado: nuevoEstado,
            fecha_entrega: nuevoEstado === 'entregado' ? new Date().toISOString() : null
          });
        }

        alert(`✅ Pedido ${nuevoEstado === 'entregado' ? 'marcado como entregado' : 'actualizado'} correctamente`);
      } else {
        const error = await response.json();
        console.error('❌ Error de la API:', error);
        alert('❌ Error al actualizar el pedido: ' + error.error);
      }
    } catch (error) {
      console.error('❌ Error de red:', error);
      alert('❌ Error de red al actualizar el pedido: ' + error.message);
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

  const getEstadoColor = (estado) => {
  switch (estado) {
    case 'pendiente': 
    case 'Pendiente': return 'bg-yellow-100 text-yellow-800'; // ⚡ AGREGADO
    case 'entregado': 
    case 'Entregado': return 'bg-green-100 text-green-800';   // ⚡ AGREGADO
    case 'cancelado': 
    case 'Cancelado': return 'bg-red-100 text-red-800';       // ⚡ AGREGADO
    default: return 'bg-gray-100 text-gray-800';
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📦 Gestión de Pedidos
              </h1>
              <p className="text-gray-600 mt-1">
                {pedidosFiltrados.length} pedidos encontrados
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="entregado">Entregados</option>
                <option value="cancelado">Cancelados</option>
              </select>
              
              <select
                value={filtroTorre}
                onChange={(e) => setFiltroTorre(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las torres</option>
                <option value="1">Torre 1</option>
                <option value="2">Torre 2</option>
                <option value="3">Torre 3</option>
                <option value="4">Torre 4</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 text-yellow-600 p-3 rounded-xl">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">
                  {pedidos.filter(p => p.estado === 'Pendiente').length}
                </p>
                <p className="text-gray-600">Pendientes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">
                  {pedidos.filter(p => p.estado === 'entregado').length}
                </p>
                <p className="text-gray-600">Entregados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">
                  ${pedidos.reduce((acc, p) => acc + (p.total || 0), 0).toLocaleString()}
                </p>
                <p className="text-gray-600">Total vendido</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-xl">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-800">
                  {new Set(pedidos.map(p => p.torre_entrega).filter(Boolean)).size}
                </p>
                <p className="text-gray-600">Torres activas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de pedidos */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedido
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección Entrega
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {pedido.numero_pedido}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pedido.productos?.length || 0} productos
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {pedido.usuario?.nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {pedido.telefono_contacto}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        Torre {pedido.torre_entrega} - Piso {pedido.piso_entrega}
                      </div>
                      <div className="text-sm text-gray-500">
                        Apt {pedido.apartamento_entrega}
                      </div>
                      {pedido.horario_preferido && (
                        <div className="text-sm text-gray-500">
                          Prefiere: {pedido.horario_preferido}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${pedido.total?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(pedido.estado)}`}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(pedido.fecha_pedido)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setPedidoSeleccionado(pedido);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                      >
                        Ver Detalles
                      </button>
                      {pedido.estado === 'Pendiente' && (
                        <button
                          onClick={() => cambiarEstadoPedido(pedido.id, 'entregado')}
                          className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition-colors"
                        >
                          ✓ Entregado
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {pedidosFiltrados.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay pedidos</h3>
            <p className="text-gray-500">No se encontraron pedidos con los filtros seleccionados</p>
          </div>
        )}
      </div>

      {/* Modal de detalles del pedido */}
      {showModal && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Detalles del Pedido {pedidoSeleccionado.numero_pedido}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información del cliente */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                      </svg>
                      Información del Cliente
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <p><span className="font-medium">Nombre:</span> {pedidoSeleccionado.usuario?.nombre}</p>
                      <p><span className="font-medium">Email:</span> {pedidoSeleccionado.usuario?.email}</p>
                      <p><span className="font-medium">Teléfono:</span> {pedidoSeleccionado.telefono_contacto}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                      Dirección de Entrega
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <p><span className="font-medium">Torre:</span> {pedidoSeleccionado.torre_entrega}</p>
                      <p><span className="font-medium">Piso:</span> {pedidoSeleccionado.piso_entrega}</p>
                      <p><span className="font-medium">Apartamento:</span> {pedidoSeleccionado.apartamento_entrega}</p>
                      <p><span className="font-medium">Horario preferido:</span> {pedidoSeleccionado.horario_preferido || 'Sin preferencia'}</p>
                      {pedidoSeleccionado.instrucciones_entrega && (
                        <p><span className="font-medium">Instrucciones:</span> {pedidoSeleccionado.instrucciones_entrega}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                      </svg>
                      Estado del Pedido
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getEstadoColor(pedidoSeleccionado.estado)}`}>
                          {pedidoSeleccionado.estado}
                        </span>
                        {pedidoSeleccionado.estado === 'Pendiente' && (
                          <button
                            onClick={() => cambiarEstadoPedido(pedidoSeleccionado.id, 'entregado')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            ✓ Marcar como Entregado
                          </button>
                        )}
                      </div>
                      <p><span className="font-medium">Fecha del pedido:</span> {formatearFecha(pedidoSeleccionado.fecha_pedido)}</p>
                      {pedidoSeleccionado.fecha_entrega && (
                        <p><span className="font-medium">Fecha de entrega:</span> {formatearFecha(pedidoSeleccionado.fecha_entrega)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Productos del pedido */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM8 15v-3a1 1 0 011-1h2a1 1 0 011 1v3h-4z" clipRule="evenodd"/>
                    </svg>
                    Productos ({pedidoSeleccionado.productos?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {pedidoSeleccionado.productos?.map((producto, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">{producto.nombre}</p>
                          <p className="text-sm text-gray-600">Cantidad: {producto.cantidad}</p>
                          <p className="text-sm text-gray-600">Precio unitario: ${producto.precio?.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">
                            ${((producto.precio || 0) * (producto.cantidad || 0)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">Total del Pedido:</span>
                      <span className="text-2xl font-bold text-blue-600">
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