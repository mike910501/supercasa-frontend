import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // 👈 Agrega esta línea arriba si no la tienes

export default function Dashboard() {
  const [productos, setProductos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});
  const [cargando, setCargando] = useState(true);

  const cargarProductos = () => {
    fetch(`${API_URL}/productos')
      .then(res => res.json())
      .then(data => {
        setProductos(data);
        setCargando(false);
      })
      .catch(err => {
        console.error('Error al cargar productos:', err);
        setCargando(false);
      });
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;

    try {
      await fetch(`http://localhost:3000/productos/${id}`, { method: 'DELETE' });
      setProductos(productos.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error eliminando:', err);
    }
  };

  const guardarCambios = async (id) => {
    try {
      await fetch(`http://localhost:3000/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setEditando(null);
      cargarProductos();
    } catch (err) {
      console.error('Error editando:', err);
    }
  };

  const comenzarEdicion = (producto) => {
    setEditando(producto.id);
    setForm({
      nombre: producto.nombre,
      precio: producto.precio,
      descripcion: producto.descripcion,
      nutricional: producto.nutricional
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">📦 Productos disponibles</h2>
      <div className="mb-6 flex justify-end">
  <Link
    to="/dashboard/orders"
    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
  >
    📋 Ver pedidos
  </Link>
</div>




      {cargando ? (
        <p>Cargando productos...</p>
      ) : productos.length === 0 ? (
        <p>No hay productos aún.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {productos.map((producto) => (
            <div key={producto.id} className="border p-4 rounded shadow">
              {editando === producto.id ? (
                <div className="space-y-2">
                  <input
                    className="w-full border px-2 py-1 rounded"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                  />
                  <input
                    className="w-full border px-2 py-1 rounded"
                    value={form.precio}
                    type="number"
                    onChange={e => setForm({ ...form, precio: e.target.value })}
                  />
                  <textarea
                    className="w-full border px-2 py-1 rounded"
                    value={form.descripcion}
                    onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  />
                  <textarea
                    className="w-full border px-2 py-1 rounded"
                    value={form.nutricional}
                    onChange={e => setForm({ ...form, nutricional: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded"
                      onClick={() => guardarCambios(producto.id)}
                    >
                      💾 Guardar
                    </button>
                    <button
                      className="text-gray-600 underline"
                      onClick={() => setEditando(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">{producto.nombre}</h3>
                  <p className="text-blue-700 font-bold">${producto.precio}</p>
                  {producto.descripcion && <p className="text-sm mt-2">{producto.descripcion}</p>}
                  {producto.nutricional && (
                    <p className="text-xs text-gray-500 mt-1">{producto.nutricional}</p>
                  )}
                  <div className="mt-3 flex justify-between text-sm">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => comenzarEdicion(producto)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => eliminarProducto(producto.id)}
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
