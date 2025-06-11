import React, { useState } from 'react';

export default function ProductForm() {
  const [producto, setProducto] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    nutricional: '',
    categoria: '',
    imagen: '',
  });
  const [cart, setCart] = useState([]);  // Estado para el carrito

  // Maneja cambios en los campos de input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto({ ...producto, [name]: value });
  };

  // Función para agregar el producto al carrito
  const handleAddToCart = () => {
    const newProduct = { ...producto, id: new Date().getTime() };  // Asignamos un id único basado en el tiempo
    setCart([...cart, newProduct]);  // Añadimos el nuevo producto al carrito
    setProducto({
      nombre: '',
      precio: '',
      descripcion: '',
      nutricional: '',
      categoria: '',
      imagen: '',
    });  // Limpiamos el formulario
  };

  // Función para eliminar un producto del carrito
  const handleRemoveFromCart = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);  // Filtramos el producto por ID
    setCart(updatedCart);  // Actualizamos el carrito
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Agregar producto</h2>

      {/* Formulario para agregar productos */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddToCart();
        }}
        className="space-y-4"
      >
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del producto"
          value={producto.nombre}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <input
          type="number"
          name="precio"
          placeholder="Precio"
          value={producto.precio}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={producto.descripcion}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <textarea
          name="nutricional"
          placeholder="Información nutricional"
          value={producto.nutricional}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          name="categoria"
          placeholder="Categoría (ej: Huevos, Lácteos, Bebidas...)"
          value={producto.categoria}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <input
          type="text"
          name="imagen"
          placeholder="URL de la imagen del producto"
          value={producto.imagen}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Guardar producto
        </button>
      </form>

      {/* Mostrar el carrito */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold">Carrito de Compras</h3>
        {cart.length === 0 ? (
          <p>El carrito está vacío.</p>
        ) : (
          <ul className="space-y-4">
            {cart.map((item) => (
              <li key={item.id} className="border p-4 rounded shadow">
                <p><strong>{item.nombre}</strong> - ${item.precio}</p>
                <button
                  onClick={() => handleRemoveFromCart(item.id)}  // Eliminar el producto por su ID
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={handleAddToCart}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4"
        >
          Añadir al carrito
        </button>
      </div>
    </div>
  );
}
