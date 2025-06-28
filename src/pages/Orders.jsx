// src/pages/Orders.jsx
// Página de pedidos del usuario - VERSIÓN CORREGIDA Y MEJORADA

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// ✅ CONFIGURACIÓN DE API
const API_URL = process.env.REACT_APP_API_URL || 'https://supercasa-backend-vvu1.onrender.com';

export default function Orders() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  // ✅ FUNCIÓN PARA CARGAR PEDIDOS
  const fetchPedidos = () => {
    setLoading(true);
    setError(null);
    
    fetch(`${API_URL}/orders`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Error al cargar pedidos');
        }
        return res.json();
      })
      .then(data => {
        setPedidos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando pedidos:', err);
        setError('❌ Error al cargar pedidos');
        setLoading(false);
        toast.error('Error al cargar pedidos');
      });
  };

  // ✅ FUNCIÓN PARA MARCAR COMO ENTREGADO
  const handleMarkAsDelivered = (pedidoId) => {
    // Mostrar confirmación
    if (!window.confirm('¿Marcar este pedido como entregado?')) {
      return;
    }

    fetch(`${API_URL}/orders/${pedidoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        estado: 'Entregado',
      }),
    })
    .then(res => {
      if (!res.ok) {
        throw new Error('Error al actualizar pedido');
      }
      return res.json();
    })
    .then(updatedPedido => {
      // Actualizar estado local
      setPedidos(pedidos.map(pedido => 
        pedido.id === pedidoId ? { ...pedido, estado: 'Entregado' } : pedido
      ));
      toast.success('✅ Pedido marcado como entregado');
    })
    .catch(err => {
      console.error('Error:', err);
      setError('❌ Error al marcar como entregado');
      toast.error('Error al marcar como entregado');
    });
  };

  // ✅ FUNCIÓN PARA OBTENER COLOR DEL ESTADO
  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'entregado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // ✅ FUNCIÓN PARA OBTENER ICONO DEL ESTADO
  const getStatusIcon = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return '⏳';
      case 'entregado':
        return '✅';
      case 'cancelado':
        return '❌';
      default:
        return '📦';
    }
  };

  // ✅ PARSEAR PRODUCTOS SEGURAMENTE
  const parseProductos = (productos) => {
    try {
      if (typeof productos === 'string') {
        return JSON.parse(productos);
      }
      if (Array.isArray(productos)) {
        return productos;
      }
      return [];
    } catch (error) {
      console.error('Error parsing productos:', error);
      return [];
    }
  };

  // ✅ ESTADO DE CARGA
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  // ✅ ESTADO DE ERROR
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchPedidos}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              🔄 Reintentar
            </button>
            <button
              onClick={() => navigate('/store')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              🛍️ Ir a la Tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📦 Mis Pedidos</h1>
              <p className="text-gray-600 mt-1">Historial de compras en Supercasa</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={fetchPedidos}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                🔄 Actualizar
              </button>
              <button
                onClick={() => navigate('/store')}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all"
              >
                🛍️ Seguir Comprando
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {pedidos.length === 0 ? (
          // ✅ ESTADO VACÍO
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No tienes pedidos aún</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              ¡Haz tu primera compra en Supercasa! Tenemos productos frescos con entrega en máximo 20 minutos.
            </p>
            <button
              onClick={() => navigate('/store')}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              🛍️ Explorar Productos
            </button>
          </div>
        ) : (
          // ✅ LISTA DE PEDIDOS
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Mostrando {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}
              </p>
            </div>

            {pedidos.map((pedido) => {
              const productos = parseProductos(pedido.productos);
              
              return (
                <div key={pedido.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header del pedido */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Pedido #{pedido.id}
                        </h3>
                        <p className="text-gray-600">
                          {pedido.fecha_creacion ? 
                            new Date(pedido.fecha_creacion).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 
                            new Date(pedido.fecha).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          }
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(pedido.estado)}`}>
                        {getStatusIcon(pedido.estado)} {pedido.estado || 'Pendiente'}
                      </span>
                    </div>

                    {/* Grid de información */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      {/* Total */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">💰 Total Pagado</h4>
                        <p className="text-2xl font-bold text-green-600">
                          ${parseInt(pedido.total).toLocaleString()} COP
                        </p>
                      </div>

                      {/* Información de entrega */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">📍 Entrega</h4>
                        <p className="text-gray-700">
                          Torre {pedido.torre_entrega || 'N/A'}, Piso {pedido.piso_entrega || 'N/A'}
                        </p>
                        <p className="text-gray-700">
                          Apt {pedido.apartamento_entrega || 'N/A'}
                        </p>
                        {pedido.instrucciones_entrega && (
                          <p className="text-xs text-gray-500 mt-1">
                            📝 {pedido.instrucciones_entrega}
                          </p>
                        )}
                      </div>

                      {/* Contacto */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-1">📞 Contacto</h4>
                        <p className="text-gray-700">
                          {pedido.telefono_contacto || 'No especificado'}
                        </p>
                      </div>
                    </div>

                    {/* Productos */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="font-semibold text-gray-900 mb-4">📦 Productos ({productos.length})</h4>
                      {productos.length > 0 ? (
                        <div className="grid gap-3">
                          {productos.map((prod, i) => (
                            <div key={i} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                                  {prod.cantidad || 1}
                                </span>
                                <span className="font-medium text-gray-900">{prod.nombre}</span>
                              </div>
                              <span className="font-bold text-gray-900">
                                ${(prod.precio * (prod.cantidad || 1)).toLocaleString()} COP
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No hay productos disponibles</p>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {pedido.payment_reference && (
                            <span>Ref. Pago: {pedido.payment_reference}</span>
                          )}
                        </div>
                        <div className="flex space-x-3">
                          {pedido.estado === 'Entregado' ? (
                            <div className="flex items-center space-x-2 text-green-600">
                              <span className="text-2xl">✅</span>
                              <span className="font-semibold">Pedido Entregado</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleMarkAsDelivered(pedido.id)}
                              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
                            >
                              ✅ Marcar como Entregado
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}



