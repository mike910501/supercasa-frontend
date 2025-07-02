import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';

export default function ChatWidget({ productos = [], agregarAlCarrito, darkMode = false }) {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [mensajes, setMensajes] = useState([
    { de: 'bot', texto: '¡Hola! 👋 Soy el asistente de Supercasa. ¿En qué puedo ayudarte?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // 🧠 Estado conversacional para productos
  const [estadoConversacion, setEstadoConversacion] = useState({
    productoPendiente: null,
    esperandoCantidad: false,
  });

  // 💾 PERSISTENCIA - Cargar mensajes guardados
  useEffect(() => {
    const mensajesGuardados = localStorage.getItem('chat_mensajes');
    if (mensajesGuardados) {
      try {
        const mensajesParsed = JSON.parse(mensajesGuardados);
        if (mensajesParsed.length > 0) {
          setMensajes(mensajesParsed);
        }
      } catch (error) {
        console.error('Error cargando chat:', error);
      }
    }
  }, []);

  // 💾 PERSISTENCIA - Guardar mensajes
  useEffect(() => {
    if (mensajes.length > 1) { // No guardar solo el mensaje inicial
      localStorage.setItem('chat_mensajes', JSON.stringify(mensajes));
    }
  }, [mensajes]);

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

  // 📱 Función para detectar cuando necesita soporte técnico
  const necesitaEscalamiento = (mensaje) => {
    const texto = limpiarTexto(mensaje);
    const palabrasClave = [
      'problema', 'error', 'no funciona', 'bug', 'fallo', 'soporte',
      'reclamo', 'queja', 'devolucion', 'cancelar', 'reembolso',
      'no puedo', 'no me deja', 'no carga', 'ayuda urgente',
      'soporte tecnico', 'no me funciona', 'esta malo'
    ];
    return palabrasClave.some(palabra => texto.includes(palabra));
  };

  const limpiarChat = () => {
    setMensajes([{ de: 'bot', texto: '¡Hola! 👋 Soy el asistente de Supercasa. ¿En qué puedo ayudarte?' }]);
    setEstadoConversacion({ productoPendiente: null, esperandoCantidad: false });
    localStorage.removeItem('chat_mensajes');
  };

  const enviarMensaje = async () => {
    if (!input.trim() || isLoading) return;

    const textoUsuario = input.trim();
    setMensajes((prev) => [...prev, { de: 'usuario', texto: textoUsuario }]);
    setInput('');
    setIsLoading(true);

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
          texto: `✅ ¡Listo! Agregué ${cantidad} ${estadoConversacion.productoPendiente.nombre} al carrito. Ve al carrito para finalizar tu pedido 🛒`,
        },
      ]);

      setEstadoConversacion({ productoPendiente: null, esperandoCantidad: false });
      setIsLoading(false);
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
          texto: `👍 Perfecto. Tenemos ${productoDetectado.nombre} por $${productoDetectado.precio.toLocaleString()}. ¿Cuántos quieres agregar?`,
        },
      ]);
      setIsLoading(false);
      return;
    }

    // 🧠 Si solo se detecta producto pero no hay intención clara aún
    if (productoDetectado && !estadoConversacion.esperandoCantidad) {
      setMensajes((prev) => [
        ...prev,
        {
          de: 'bot',
          texto: `Tenemos ${productoDetectado.nombre} por $${productoDetectado.precio.toLocaleString()} 💰 ¿Te gustaría comprarlo?`,
        },
      ]);
      setIsLoading(false);
      return;
    }

    // 🌐 Llamada a la IA con CONTEXTO
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mensaje: textoUsuario,
          historial: mensajes // ✅ ENVIAR HISTORIAL COMPLETO
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setMensajes((prev) => [...prev, { de: 'bot', texto: data.respuesta }]);
    } catch (err) {
      console.error('❌ Error chat:', err);
      setMensajes((prev) => [
        ...prev,
        {
          de: 'bot',
          texto: '⚠️ Disculpa, tuve un problemita técnico. ¿Puedes intentar de nuevo? 😅',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Botón flotante */}
      <button
        className={`fixed bottom-6 right-3 sm:right-6 text-white px-4 py-3 rounded-full shadow-lg z-50 transition-all duration-300 ${
          darkMode 
            ? 'bg-blue-700 hover:bg-blue-800' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        onClick={() => setVisible(!visible)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <span className="hidden sm:inline text-sm font-medium">Chat</span>
        </div>
      </button>

      {/* Chat modal */}
      {visible && (
        <div className={`fixed bottom-20 right-2 sm:right-6 w-[95vw] sm:w-80 max-w-sm shadow-2xl rounded-xl border z-50 flex flex-col transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-300'
        }`}>
          {/* Header */}
          <div className={`p-4 font-semibold border-b flex justify-between items-center transition-colors duration-300 ${
            darkMode ? 'border-gray-600 text-white' : 'border-gray-200 text-gray-800'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span>Asistente Supercasa</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={limpiarChat}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Limpiar chat"
              >
                🗑️
              </button>
              <button
                onClick={() => setVisible(false)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Cerrar chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="p-3 h-64 overflow-y-auto space-y-3 text-sm">
            {mensajes.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg ${
                  msg.de === 'bot'
                    ? darkMode
                      ? 'bg-gray-700 text-gray-100 text-left'
                      : 'bg-gray-100 text-gray-800 text-left'
                    : darkMode
                      ? 'bg-blue-700 text-white text-right ml-6'
                      : 'bg-blue-100 text-blue-900 text-right ml-6'
                }`}
              >
                {msg.texto}
              </div>
            ))}
            
            {/* Indicador de carga */}
            {isLoading && (
              <div className={`p-3 rounded-lg text-left ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-xs">Escribiendo...</span>
                </div>
              </div>
            )}
          </div>

          {/* 📱 BOTÓN WHATSAPP CUANDO NECESITA SOPORTE */}
          {input && necesitaEscalamiento(input) && (
            <div className={`p-3 border-t transition-colors duration-300 ${
              darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-green-50'
            }`}>
              <p className={`text-sm mb-2 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-green-800'
              }`}>
                🤔 Parece que necesitas soporte especializado.
              </p>
              <a
                href="https://wa.me/573133592457?text=Hola%2C%20necesito%20soporte%20t%C3%A9cnico%20con%20Supercasa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
              >
                <span>📱</span>
                <span>Contactar por WhatsApp</span>
              </a>
            </div>
          )}

          {/* Input */}
          <div className={`flex border-t transition-colors duration-300 ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`flex-1 p-3 text-sm outline-none transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-800 text-white placeholder-gray-400' 
                  : 'bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Escribe tu mensaje..."
              onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
              disabled={isLoading}
            />
            <button
              className={`px-4 text-sm font-medium transition-colors duration-300 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : darkMode
                    ? 'bg-blue-700 hover:bg-blue-800'
                    : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              onClick={enviarMensaje}
              disabled={isLoading}
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}