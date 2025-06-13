import React, { useState } from 'react';
import API_URL from '../config/api'; // ⚡ AGREGADO: Import de configuración de API

export default function ChatWidget({ productos = [], agregarAlCarrito }) {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [mensajes, setMensajes] = useState([
    { de: 'bot', texto: 'Hola 👋 ¿En qué puedo ayudarte hoy?' }
  ]);

  // 🧠 Estado conversacional
  const [estadoConversacion, setEstadoConversacion] = useState({
    productoPendiente: null,
    esperandoCantidad: false,
  });

  const limpiarTexto = (texto) =>
    texto
      .replace(/[;:]/g, '')
      .replace(/aadelos|adelos|alade/gi, 'agregalos')
      .trim()
      .toLowerCase();

  const detectarProducto = (mensaje) => {
    const textoLimpio = limpiarTexto(mensaje);
    return productos.find((p) =>
      textoLimpio.includes(p.nombre.toLowerCase())
    );
  };

  const detectarIntencionDeCompra = (mensaje) => {
    const texto = limpiarTexto(mensaje);
    const patrones = ['agrega', 'quiero', 'comprar', 'añade', 'sí', 'si', 'lo quiero'];
    return patrones.some((p) => texto.includes(p));
  };

  const enviarMensaje = async () => {
    if (!input.trim()) return;

    const textoUsuario = input.trim();
    setMensajes((prev) => [...prev, { de: 'usuario', texto: textoUsuario }]);
    setInput('');

    const textoLimpio = limpiarTexto(textoUsuario);
    const cantidad = parseInt(textoLimpio);

    // 🧠 Si está esperando cantidad
    if (estadoConversacion.esperandoCantidad && estadoConversacion.productoPendiente && !isNaN(cantidad)) {
      for (let i = 0; i < cantidad; i++) {
        agregarAlCarrito(estadoConversacion.productoPendiente);
      }

      setMensajes((prev) => [
        ...prev,
        {
          de: 'bot',
          texto: `✅ Listo, agregué ${cantidad} paquete(s) de ${estadoConversacion.productoPendiente.nombre} al carrito.`,
        },
      ]);

      setEstadoConversacion({ productoPendiente: null, esperandoCantidad: false });
      return;
    }

    const productoDetectado = detectarProducto(textoUsuario);
    const quiereComprar = detectarIntencionDeCompra(textoUsuario);

    // 🧠 Si quiere comprar algo y detectamos el producto
    if (quiereComprar && productoDetectado) {
      setEstadoConversacion({
        productoPendiente: productoDetectado,
        esperandoCantidad: true,
      });

      setMensajes((prev) => [
        ...prev,
        {
          de: 'bot',
          texto: `👍 Perfecto. ¿Cuántos paquetes de ${productoDetectado.nombre} deseas agregar?`,
        },
      ]);
      return;
    }

    // 🧠 Si solo se detecta producto pero no hay intención clara aún
    if (productoDetectado && !estadoConversacion.esperandoCantidad) {
      setMensajes((prev) => [
        ...prev,
        {
          de: 'bot',
          texto: `Tenemos ${productoDetectado.nombre} por $${productoDetectado.precio}. ¿Te gustaría comprarlo?`,
        },
      ]);
      return;
    }

    // 🌐 Llamada a la IA si no se cumple lo anterior
    try {
      // ✅ CORREGIDO: URL dinámica con template literals correctos
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: textoUsuario }),
      });

      const data = await res.json();
      setMensajes((prev) => [...prev, { de: 'bot', texto: data.respuesta }]);
    } catch (err) {
      setMensajes((prev) => [
        ...prev,
        {
          de: 'bot',
          texto: '⚠️ Lo siento, hubo un problema al conectar con el servidor de IA.',
        },
      ]);
    }
  };

  return (
    <div>
      <button
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-50"
        onClick={() => setVisible(!visible)}
      >
        💬 Chat
      </button>

      {visible && (
        <div className="fixed bottom-20 right-6 w-80 bg-white shadow-lg rounded-xl border border-gray-300 z-50 flex flex-col">
          <div className="p-3 font-semibold border-b">Asistente Supercasa</div>
          <div className="p-3 h-64 overflow-y-auto space-y-2 text-sm">
            {mensajes.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded ${
                  msg.de === 'bot'
                    ? 'bg-gray-100 text-left'
                    : 'bg-blue-100 text-right'
                }`}
              >
                {msg.texto}
              </div>
            ))}
          </div>
          <div className="flex border-t">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-2 text-sm outline-none"
              placeholder="Escribe tu mensaje..."
              onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
            />
            <button
              className="bg-blue-600 text-white px-4 text-sm"
              onClick={enviarMensaje}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


