import React, { useEffect, useState } from 'react';

export default function Store() {
  const [productos, setProductos] = useState([]); // Productos de la base de datos
  const [carrito, setCarrito] = useState([]); // Carrito de compras
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(''); // Filtro de categoría
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Estado para el menú móvil

  // Cargar productos desde la base de datos
  useEffect(() => {
    fetch('http://localhost:3000/productos')
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((error) => console.error('Error al cargar los productos:', error));
  }, []);

  // Filtrar productos por categoría
  const productosFiltrados = categoriaSeleccionada
    ? productos.filter((producto) => producto.categoria === categoriaSeleccionada)
    : productos;

  // Obtener categorías únicas de los productos
  const categorias = [...new Set(productos.map((producto) => producto.categoria))];

  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    const productoExistente = carrito.find((item) => item.id === producto.id);

    if (productoExistente) {
      const nuevoCarrito = carrito.map((item) =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      );
      setCarrito(nuevoCarrito);
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  // Eliminar producto del carrito
  const eliminarDelCarrito = (productoId) => {
    const productoExistente = carrito.find((item) => item.id === productoId);

    if (productoExistente.cantidad > 1) {
      const nuevoCarrito = carrito.map((item) =>
        item.id === productoId
          ? { ...item, cantidad: item.cantidad - 1 }
          : item
      );
      setCarrito(nuevoCarrito);
    } else {
      const nuevoCarrito = carrito.filter((item) => item.id !== productoId);
      setCarrito(nuevoCarrito);
    }
  };

  const finalizarCompra = async () => {
    if (carrito.length === 0) return alert('El carrito está vacío');

    const totalPedido = carrito.reduce((acc, item) => acc + Number(item.precio) * item.cantidad, 0);

    if (isNaN(totalPedido)) {
      console.error('🚫 totalPedido es NaN');
      alert('Error: el total del pedido no es válido');
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productos: carrito,
          total: totalPedido,
        }),
      });

      if (res.ok) {
        alert('✅ Pedido realizado correctamente');
        setCarrito([]); // Limpiar carrito
      } else {
        const err = await res.json();
        alert('❌ Error al realizar el pedido: ' + err.error);
      }
    } catch (error) {
      alert('❌ Error de red al realizar el pedido');
      console.error(error);
    }
  };

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center mb-10">🛒 Bienvenido a Supercasa</h1>

      {/* Menú Móvil */}
      <div className="mb-6">
        <button
          className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? 'Cerrar menú' : 'Filtrar por categoría'}
        </button>
        {isMobileMenuOpen && (
          <div className="block lg:hidden mt-4">
            <select
              id="categoria"
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((categoria, index) => (
                <option key={index} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Mostrar productos filtrados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {productosFiltrados.map((producto) => (
          <div key={producto.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-200 flex flex-col transform hover:scale-105">
            {producto.imagen && (
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="h-40 w-full object-cover"
              />
            )}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{producto.nombre}</h3>
                <p className="text-blue-700 font-semibold text-lg">${producto.precio}</p>
                {producto.categoria && (
                  <p className="text-xs text-gray-500 italic mt-1">Categoría: {producto.categoria}</p>
                )}
                {producto.descripcion && (
                  <p className="text-sm mt-2 text-gray-700">📝 {producto.descripcion}</p>
                )}
                {producto.nutricional && (
                  <p className="text-xs text-gray-600 mt-1">🔍 {producto.nutricional}</p>
                )}
              </div>
              <button
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                onClick={() => agregarAlCarrito(producto)}
              >
                ➕ Agregar al carrito
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <h2 className="text-xl font-bold mb-2">🧾 Carrito de compras</h2>
        {carrito.length === 0 ? (
          <p className="text-gray-600">Tu carrito está vacío.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {carrito.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  <span>{item.nombre} (x{item.cantidad})</span>
                  <span>${item.precio * item.cantidad}</span>
                  <button
                    onClick={() => eliminarDelCarrito(item.id)}  // Llamamos a la función para eliminar el producto
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    ❌ Eliminar
                  </button>
                </li>
              ))}
              <li className="flex justify-between font-bold border-t pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </li>
            </ul>
            <button
              onClick={finalizarCompra}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🏭️ Finalizar compra
            </button>
          </>
        )}
      </div>
    </div>
  );
}






