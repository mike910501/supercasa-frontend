import React, { useEffect, useState } from 'react';

export default function Orders() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);  // Estado de carga
  const [error, setError] = useState(null);      // Estado de error

  useEffect(() => {
    fetch('http://localhost:3000/orders')
      .then(res => res.json())
      .then(data => {
        setPedidos(data);
        setLoading(false);  // Detener estado de carga cuando los datos estén listos
      })
      .catch(err => {
        setError('❌ Error al cargar pedidos');
        setLoading(false);  // Detener estado de carga en caso de error
      });
  }, []);

  const handleMarkAsDelivered = (pedidoId) => {
    fetch(`http://localhost:3000/orders/${pedidoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        estado: 'Entregado',  // Cambia el estado a "Entregado"
      }),
    })
    .then(res => res.json())
    .then(updatedPedido => {
      // Actualizar el estado localmente después de la respuesta exitosa
      setPedidos(pedidos.map(pedido => 
        pedido.id === pedidoId ? { ...pedido, estado: 'Entregado' } : pedido
      ));
    })
    .catch(err => {
      setError('❌ Error al marcar como entregado');
      console.error(err);
    });
  };

  // Si los datos están cargando, muestra el mensaje de carga
  if (loading) {
    return <p>Cargando pedidos...</p>;
  }

  // Si ocurre un error, muestra el mensaje de error
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Pedidos realizados</h2>
      {pedidos.length === 0 ? <p>No hay pedidos.</p> : (
        <ul className="space-y-4">
          {pedidos.map((pedido, idx) => (
            <li key={idx} className="border rounded p-4 shadow">
              <p><strong>Total:</strong> ${pedido.total}</p>
              <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}</p>
              <p><strong>Productos:</strong></p>
              <ul className="ml-4 list-disc">
                {/* Validar si productos está definido y es un array */}
                {(pedido.productos && Array.isArray(pedido.productos)) ? (
                  pedido.productos.map((prod, i) => (
                    <li key={i}>{prod.nombre} - ${prod.precio}</li>
                  ))
                ) : (
                  <li>No hay productos disponibles</li>
                )}
              </ul>
              <div className="mt-4">
                {pedido.estado === 'Entregado' ? (
                  <span className="text-green-500">Entregado</span>
                ) : (
                  <button
                    onClick={() => handleMarkAsDelivered(pedido.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Marcar como entregado
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}



