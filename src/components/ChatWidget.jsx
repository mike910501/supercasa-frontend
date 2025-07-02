import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';

export default function ChatWidget({ productos = [], agregarAlCarrito, darkMode = false }) {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [mensajes, setMensajes] = useState([
    { de: 'bot', texto: '¡Hola! 👋 Soy el asistente de Supercasa. ¿En qué puedo ayudarte?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarSoporte, setMostrarSoporte] = useState(false);
  const [consultasPedido, setConsultasPedido] = useState({});

  // 🧠 Estado conversacional para productos
  const [estadoConversacion, setEstadoConversacion] = useState({
    productoPendiente: null,
    esperandoCantidad: false,
  });

 useEffect(() => {
  // 💾 Cargar mensajes guardados
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

  // 🆕 Verificar parámetros URL para abrir chat automáticamente
  const urlParams = new URLSearchParams(window.location.search);
  const openChat = urlParams.get('openChat');
  const pedidoConsulta = urlParams.get('pedido');
  
  if (openChat === 'true') {
    console.log('📱 Abriendo chat desde URL con pedido:', pedidoConsulta);
    setVisible(true);
    
    if (pedidoConsulta) {
      setInput(pedidoConsulta);
      
      // Auto-enviar el mensaje después de 1 segundo
      setTimeout(() => {
        if (pedidoConsulta.trim()) {
          console.log('🚀 Auto-enviando mensaje:', pedidoConsulta);
          
          // Agregar mensaje del usuario
          setMensajes((prev) => [...prev, { de: 'usuario', texto: pedidoConsulta }]);
          setInput('');
          setIsLoading(true);
          
          // Procesar el mensaje
          enviarMensajeDirecto(pedidoConsulta);
        }
      }, 1000);
    }
    
    // Limpiar URL sin recargar
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);

  // 💾 PERSISTENCIA - Guardar mensajes
  useEffect(() => {
    if (mensajes.length > 1) {
      localStorage.setItem('chat_mensajes', JSON.stringify(mensajes));
    }
  }, [mensajes]);

  // 🆕 NUEVO: Escuchar eventos para abrir chat con pedido
  useEffect(() => {
    const handleAbrirChatConPedido = (event) => {
      const { numeroPedido } = event.detail;
      setVisible(true);
      setInput(numeroPedido);
    };

    window.addEventListener('abrirChatConPedido', handleAbrirChatConPedido);
    
    return () => {
      window.removeEventListener('abrirChatConPedido', handleAbrirChatConPedido);
    };
  }, []);
  const enviarMensajeDirecto = async (textoUsuario) => {
  if (!textoUsuario.trim()) {
    setIsLoading(false);
    return;
  }

  const textoLimpio = limpiarTexto(textoUsuario);
  
  // Detectar número de pedido
  const numeroPedido = detectarNumeroPedido(textoUsuario);
  
  if (numeroPedido) {
    const consultasActuales = consultasPedido[numeroPedido] || 0;
    setConsultasPedido(prev => ({
      ...prev,
      [numeroPedido]: consultasActuales + 1
    }));

    const pedidoInfo = await consultarPedidoReal(numeroPedido);
    
    if (pedidoInfo.encontrado) {
      let respuesta = '';
      let necesitaEscalamiento = false;
      
      if (pedidoInfo.estado === 'cancelado') {
        respuesta = `❌ Tu pedido ${numeroPedido} fue cancelado. Nuestro equipo te contactará para resolver esta situación.`;
        necesitaEscalamiento = true;
        
      } else if (pedidoInfo.estado === 'entregado') {
        if (dicePedidoNoRecibido(textoUsuario)) {
          respuesta = `🤔 Según nuestros registros, el pedido ${numeroPedido} fue entregado el ${new Date(pedidoInfo.fecha_entrega).toLocaleDateString()}. Como indicas que no lo recibiste, contactaremos a nuestro equipo.`;
          necesitaEscalamiento = true;
        } else {
          respuesta = `✅ Tu pedido ${numeroPedido} fue entregado exitosamente el ${new Date(pedidoInfo.fecha_entrega).toLocaleDateString()} en ${pedidoInfo.direccion}. Total: $${pedidoInfo.total.toLocaleString()} 🎉`;
        }
        
      } else if (pedidoInfo.estado === 'pendiente') {
        if (pedidoInfo.minutos_transcurridos > 20) {
          respuesta = `⏰ Tu pedido ${numeroPedido} lleva ${pedidoInfo.minutos_transcurridos} minutos en proceso. Como ha superado nuestro tiempo estimado, contactaremos a nuestro equipo.`;
          necesitaEscalamiento = true;
        } else {
          const tiempoRestante = Math.max(20 - pedidoInfo.minutos_transcurridos, 2);
          respuesta = `🚚 Tu pedido ${numeroPedido} está en proceso. Tiempo estimado: ${tiempoRestante} minutos más. Destino: ${pedidoInfo.direccion}`;
        }
      }
      
      if (pedidoInfo.necesita_escalamiento) {
        necesitaEscalamiento = true;
      }
      
      setMensajes(prev => [...prev, { de: 'bot', texto: respuesta }]);
      
      if (necesitaEscalamiento) {
        setMostrarSoporte(true);
      }
      
    } else {
      const respuestaNoEncontrado = `🔍 No encontré el pedido ${numeroPedido} en tu cuenta. Verifica el número o inicia sesión con la cuenta correcta.`;
      setMensajes(prev => [...prev, { de: 'bot', texto: respuestaNoEncontrado }]);
    }
    
    setIsLoading(false);
    return;
  }

  // Si no es un pedido, usar ChatGPT
  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        mensaje: textoUsuario,
        historial: mensajes
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

  const necesitaEscalamiento = (mensaje) => {
    const texto = limpiarTexto(mensaje);
    const palabrasClave = [
      'problema', 'error', 'no funciona', 'bug', 'fallo', 'soporte',
      'reclamo', 'queja', 'devolucion', 'cancelar', 'reembolso',
      'no puedo', 'no me deja', 'no carga', 'ayuda urgente',
      'soporte tecnico', 'no me funciona', 'esta malo',
      'hablar con soporte', 'contactar soporte'
    ];
    return palabrasClave.some(palabra => texto.includes(palabra));
  };

  const detectarNumeroPedido = (mensaje) => {
    const regex = /SUP-(\d+)|sup-(\d+)/gi;
    const match = mensaje.match(regex);
    return match ? match[0].toUpperCase() : null;
  };

  const dicePedidoNoRecibido = (mensaje) => {
    const texto = limpiarTexto(mensaje);
    const frases = [
      'no ha llegado', 'no me ha llegado', 'no recibí', 'no me llegó',
      'no llegó', 'no entregaron', 'no vino', 'no aparece'
    ];
    return frases.some(frase => texto.includes(frase));
  };

  const consultarPedidoReal = async (numeroPedido) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { encontrado: false, error: 'No autenticado' };
      }

      const res = await fetch(`${API_URL}/chat/pedido/${numeroPedido}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return await res.json();
    } catch (error) {
      console.error('❌ Error consultando pedido:', error);
      return { encontrado: false, error: 'Error de conexión' };
    }
  };

  const limpiarChat = () => {
    setMensajes([{ de: 'bot', texto: '¡Hola! 👋 Soy el asistente de Supercasa. ¿En qué puedo ayudarte?' }]);
    setEstadoConversacion({ productoPendiente: null, esperandoCantidad: false });
    setMostrarSoporte(false);
    setConsultasPedido({});
    localStorage.removeItem('chat_mensajes');
  };

  const enviarMensaje = async () => {
    if (!input.trim() || isLoading) return;

    const textoUsuario = input.trim();
    const textoLimpio = limpiarTexto(textoUsuario);
    
    setMensajes((prev) => [...prev, { de: 'usuario', texto: textoUsuario }]);
    setInput('');
    setIsLoading(true);

    // CONSULTA DE PEDIDOS
    const numeroPedido = detectarNumeroPedido(textoUsuario);
    
    if (numeroPedido) {
      const consultasActuales = consultasPedido[numeroPedido] || 0;
      setConsultasPedido(prev => ({
        ...prev,
        [numeroPedido]: consultasActuales + 1
      }));

      const pedidoInfo = await consultarPedidoReal(numeroPedido);
      
      if (pedidoInfo.encontrado) {
        let respuesta = '';
        let necesitaEscalamiento = false;
        
        if (pedidoInfo.estado === 'cancelado') {
          respuesta = `❌ Tu pedido ${numeroPedido} fue cancelado. Nuestro equipo te contactará para resolver esta situación.`;
          necesitaEscalamiento = true;
          
        } else if (pedidoInfo.estado === 'entregado') {
          if (dicePedidoNoRecibido(textoUsuario)) {
            respuesta = `🤔 Según nuestros registros, el pedido ${numeroPedido} fue entregado el ${new Date(pedidoInfo.fecha_entrega).toLocaleDateString()}. Como indicas que no lo recibiste, contactaremos a nuestro equipo.`;
            necesitaEscalamiento = true;
          } else {
            respuesta = `✅ Tu pedido ${numeroPedido} fue entregado exitosamente el ${new Date(pedidoInfo.fecha_entrega).toLocaleDateString()} en ${pedidoInfo.direccion}. Total: $${pedidoInfo.total.toLocaleString()} 🎉`;
          }
          
        } else if (pedidoInfo.estado === 'pendiente') {
          if (pedidoInfo.minutos_transcurridos > 20) {
            respuesta = `⏰ Tu pedido ${numeroPedido} lleva ${pedidoInfo.minutos_transcurridos} minutos en proceso. Como ha superado nuestro tiempo estimado, contactaremos a nuestro equipo.`;
            necesitaEscalamiento = true;
          } else {
            const tiempoRestante = Math.max(20 - pedidoInfo.minutos_transcurridos, 2);
            respuesta = `🚚 Tu pedido ${numeroPedido} está en proceso. Tiempo estimado: ${tiempoRestante} minutos más. Destino: ${pedidoInfo.direccion}`;
          }
        }
        
        if (pedidoInfo.necesita_escalamiento) {
          necesitaEscalamiento = true;
        }
        
        setMensajes(prev => [...prev, { de: 'bot', texto: respuesta }]);
        
        if (necesitaEscalamiento) {
          setMostrarSoporte(true);
        }
        
        setIsLoading(false);
        return;
        
      } else {
        const respuestaNoEncontrado = `🔍 No encontré el pedido ${numeroPedido} en tu cuenta. Verifica el número o inicia sesión con la cuenta correcta.`;
        setMensajes(prev => [...prev, { de: 'bot', texto: respuestaNoEncontrado }]);
        setIsLoading(false);
        return;
      }
    }

    if (necesitaEscalamiento(textoUsuario)) {
      setMostrarSoporte(true);
    }

    // RESTO DE LÓGICA (productos, ChatGPT, etc.)
    const cantidad = parseInt(textoLimpio);

    if (estadoConversacion.esperandoCantidad && estadoConversacion.productoPendiente && !isNaN(cantidad)) {
      for (let i = 0; i < cantidad; i++) {
        agregarAlCarrito(estadoConversacion.productoPendiente);
      }

      setMensajes((prev) => [
        ...prev,
        {
          de: 'bot',
          texto: `✅ ¡Listo! Agregué ${cantidad} ${estadoConversacion.productoPendiente.nombre} al carrito 🛒`,
        },
      ]);

      setEstadoConversacion({ productoPendiente: null, esperandoCantidad: false });
      setIsLoading(false);
      return;
    }

    const productoDetectado = detectarProducto(textoUsuario);
    const quiereComprar = detectarIntencionDeCompra(textoUsuario);

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

    // Llamada a ChatGPT
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mensaje: textoUsuario,
          historial: mensajes
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
    <>
      {/* Overlay para cerrar en móvil */}
      {visible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setVisible(false)}
        />
      )}

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

      {/* Chat modal - 🆕 TAMAÑOS CORREGIDOS */}
      {visible && (
        <div className={`fixed z-50 shadow-2xl rounded-xl border flex flex-col transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-300'
        } ${
          // 🆕 RESPONSIVE CORREGIDO
          'bottom-20 right-2 sm:right-6 w-[95vw] sm:w-96 md:w-80 max-w-sm h-[70vh] sm:h-96'
        }`}>
          {/* Header */}
          <div className={`p-3 sm:p-4 font-semibold border-b flex justify-between items-center transition-colors duration-300 ${
            darkMode ? 'border-gray-600 text-white' : 'border-gray-200 text-gray-800'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="text-sm sm:text-base">Asistente Supercasa</span>
            </div>
            <div className="flex gap-1 sm:gap-2">
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

          {/* Mensajes - 🆕 ALTURA FIJA Y SCROLL */}
          <div className="p-2 sm:p-3 overflow-y-auto space-y-3 text-sm flex-1">
            {mensajes.map((msg, i) => (
              <div
                key={i}
                className={`p-2 sm:p-3 rounded-lg ${
                  msg.de === 'bot'
                    ? darkMode
                      ? 'bg-gray-700 text-gray-100 text-left'
                      : 'bg-gray-100 text-gray-800 text-left'
                    : darkMode
                      ? 'bg-blue-700 text-white text-right ml-4 sm:ml-6'
                      : 'bg-blue-100 text-blue-900 text-right ml-4 sm:ml-6'
                }`}
              >
                {msg.texto}
              </div>
            ))}
            
            {/* Indicador de carga */}
            {isLoading && (
              <div className={`p-2 sm:p-3 rounded-lg text-left ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-xs">Consultando...</span>
                </div>
              </div>
            )}
          </div>

          {/* Botón WhatsApp */}
          {(mostrarSoporte || (input && necesitaEscalamiento(input))) && (
            <div className={`p-2 sm:p-3 border-t transition-colors duration-300 ${
              darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-green-50'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-green-800'
                }`}>
                  🚨 Te conectaremos con soporte especializado.
                </p>
                <button 
                  onClick={() => setMostrarSoporte(false)}
                  className={`text-xs px-1 py-1 rounded transition-colors ml-2 ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ✕
                </button>
              </div>
              <a
                href="https://wa.me/573133592457?text=Hola%2C%20necesito%20soporte%20con%20mi%20pedido%20en%20Supercasa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-green-700 transition-colors w-full justify-center"
              >
                <span>📱</span>
                <span>Contactar Soporte WhatsApp</span>
              </a>
            </div>
          )}

          {/* Input - 🆕 SIEMPRE VISIBLE */}
          <div className={`flex border-t transition-colors duration-300 ${
            darkMode ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`flex-1 p-2 sm:p-3 text-sm outline-none transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-800 text-white placeholder-gray-400' 
                  : 'bg-white text-gray-900 placeholder-gray-500'
              }`}
              placeholder="Mensaje o SUP-123..."
              onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
              disabled={isLoading}
            />
            <button
              className={`px-3 sm:px-4 text-sm font-medium transition-colors duration-300 ${
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
    </>
  );
}