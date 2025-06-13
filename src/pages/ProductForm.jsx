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
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto({ ...producto, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(producto)
      });

      if (res.ok) {
        setMensaje('✅ Producto guardado en la base de datos');
        setProducto({
          nombre: '',
          precio: '',
          descripcion: '',
          nutricional: '',
          categoria: '',
          imagen: ''
        });
      } else {
        const error = await res.json();
        setMensaje(`❌ Error: ${error.error}`);
      }
    } catch (err) {
      setMensaje(`❌ Error de red: ${err.message}`);
    }

    setTimeout(() => setMensaje(''), 3000);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Agregar producto</h2>
      {mensaje && <div className="mb-4 text-green-600 font-semibold">{mensaje}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
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
    </div>
  );
}
