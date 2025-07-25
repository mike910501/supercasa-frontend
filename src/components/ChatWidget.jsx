import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';

export default function ChatWidget({ productos = [], agregarAlCarrito, darkMode = false }) {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [mensajes, setMensajes] = useState([
    { de: 'bot', texto: '¡Hola! 👋 Soy **Luna**, tu asistente de las 5 Torres de Supercasa 🏗️. Siempre tendrás la opción de contactar a soporte, pero primero trata conmigo de gestionar tu duda - podría ayudarte más rápido 🚀 ¿En qué puedo ayudarte?' }
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
    // Cargar mensajes guardados
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

    // Verificar parámetros URL para abrir chat
    const urlParams = new URLSearchParams(window.location.search);
    const openChat = urlParams.get('openChat');
    const mensaje = urlParams.get('mensaje');
    const autoFocus = urlParams.get('autoFocus');
    
    if (openChat === 'true') {
      setVisible(true);
      
      if (mensaje) {
        setInput(mensaje);
        
        // Mensaje de bienvenida
        setTimeout(() => {
          setMensajes(prev => [...prev, { 
            de: 'bot', 
            texto: `🏗️ ¡Hola! Veo que quieres consultar el pedido ${mensaje}. Presiona el botón ➤ para ver el estado en Supercasa.` 
          }]);
        }, 500);
        
        // Focus y highlight del input
        if (autoFocus === 'true') {
          setTimeout(() => {
            const chatInput = document.querySelector('input[placeholder*="SUP"], input[placeholder*="Mensaje"]');
            if (chatInput) {
              chatInput.focus();
              chatInput.style.borderColor = '#f59e0b';
              chatInput.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
            }
          }, 1000);
        }
      }
      
      // Limpiar URL
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
      'hablar con soporte', 'contactar soporte',
      // 🆕 NUEVAS PALABRAS PARA TIEMPO
      'ya paso', 'tardo', 'demoro', 'no llega', 'lento', 'tiempo', 
      'esp', 'retraso', 'tarda', 'tarde', 'demora', 'mucho tiempo',
      'muy lento', 'no ha llegado', 'donde esta'
    ];
    return palabrasClave.some(palabra => texto.includes(palabra));
  };

  const detectarNumeroPedido = (mensaje) => {
    const regex = /SUP-(\d+)|sup-(\d+)/gi;
    const match = mensaje.match(regex);
    const resultado = match ? match[0].toUpperCase() : null;
    console.log('🔍 detectarNumeroPedido:', { mensaje, match, resultado });
    return resultado;
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
      console.log('🔑 Token disponible:', !!token);
      
      if (!token) {
        console.log('❌ No hay token de autenticación');
        return { encontrado: false, error: 'No autenticado. Por favor inicia sesión.' };
      }

      console.log('🌐 Consultando pedido:', numeroPedido);
      const res = await fetch(`${API_URL}/chat/pedido/${numeroPedido}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Respuesta del servidor:', res.status, res.statusText);

      if (res.status === 403) {
        console.log('🔒 Error 403 - Token inválido o expirado');
        localStorage.removeItem('token'); // Limpiar token inválido
        return { encontrado: false, error: 'Sesión expirada. Por favor inicia sesión nuevamente.' };
      }

      if (res.status === 404) {
        return { encontrado: false, error: 'Pedido no encontrado' };
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log('✅ Datos del pedido:', data);
      return data;

    } catch (error) {
      console.error('❌ Error consultando pedido:', error);
      return { encontrado: false, error: 'Error de conexión' };
    }
  };

  const consultarProductosDisponibles = async (busqueda) => {
    try {
      console.log('🔍 Buscando productos:', busqueda);
      
      const res = await fetch(`${API_URL}/productos/buscar/${encodeURIComponent(busqueda)}`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log('📦 Productos encontrados:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error buscando productos:', error);
      return { encontrados: false, productos: [], cantidad: 0 };
    }
  };

  const limpiarChat = () => {
    setMensajes([{ de: 'bot', texto: '¡Hola! 👋 Soy **Luna**, tu asistente de las 5 Torres de Supercasa 🏗️. Siempre tendrás la opción de contactar a soporte, pero primero trata conmigo de gestionar tu duda - podría ayudarte más rápido 🚀 ¿En qué puedo ayudarte?' }]);
    setEstadoConversacion({ productoPendiente: null, esperandoCantidad: false });
    setMostrarSoporte(false);
    setConsultasPedido({});
    localStorage.removeItem('chat_mensajes');
  };

  const enviarMensaje = async () => {
    if (!input.trim() || isLoading) return;

    const textoUsuario = input.trim();
    const textoLimpio = limpiarTexto(textoUsuario);
    
    console.log('📤 Enviando mensaje:', textoUsuario);
    
    setMensajes((prev) => [...prev, { de: 'usuario', texto: textoUsuario }]);
    setInput('');
    setIsLoading(true);

    // CONSULTA DE PEDIDOS
    const numeroPedido = detectarNumeroPedido(textoUsuario);
    console.log('🔍 Número de pedido detectado:', numeroPedido);
    
    if (numeroPedido) {
      console.log('✅ ENTRANDO A LÓGICA DE PEDIDOS');
      
      const consultasActuales = consultasPedido[numeroPedido] || 0;
      setConsultasPedido(prev => ({
        ...prev,
        [numeroPedido]: consultasActuales + 1
      }));

      const pedidoInfo = await consultarPedidoReal(numeroPedido);
      console.log('📋 Respuesta de consultarPedidoReal:', pedidoInfo);
      
      if (pedidoInfo.encontrado) {
        let respuesta = '';
        let necesitaEscalamiento = false;
        
        if (pedidoInfo.estado === 'cancelado') {
          respuesta = `❌ Tu pedido ${numeroPedido} de Supercasa fue cancelado. Nuestro equipo te contactará para resolver esta situación.`;
          necesitaEscalamiento = true;
          
        } else if (pedidoInfo.estado === 'entregado') {
          respuesta = `🏗️ ¡Perfecto! Tu pedido ${numeroPedido} de Supercasa fue entregado exitosamente el ${new Date(pedidoInfo.fecha_entrega).toLocaleDateString()} en ${pedidoInfo.direccion}. Total: $${pedidoInfo.total.toLocaleString()} 🎉`;
          
        } else if (pedidoInfo.estado === 'pendiente') {
          if (pedidoInfo.minutos_transcurridos > 20) {
            respuesta = `⏰ Tu pedido ${numeroPedido} de Supercasa lleva ${pedidoInfo.minutos_transcurridos} minutos en proceso. Como ha superado nuestro tiempo estimado de las Torres, contactaremos a nuestro equipo.`;
            necesitaEscalamiento = true;
          } else {
            const tiempoRestante = Math.max(20 - pedidoInfo.minutos_transcurridos, 2);
            respuesta = `🏗️ Tu pedido ${numeroPedido} está en camino desde Supercasa. Tiempo estimado: ${tiempoRestante} minutos más. Destino: ${pedidoInfo.direccion}`;
          }
        } else {
          respuesta = `📦 Tu pedido ${numeroPedido} de Supercasa está en estado: ${pedidoInfo.estado}. Total: $${pedidoInfo.total.toLocaleString()}`;
        }
        
        setMensajes(prev => [...prev, { de: 'bot', texto: respuesta }]);
        
        if (necesitaEscalamiento) {
          setMostrarSoporte(true);
        }
        
        setIsLoading(false);
        return;
        
      } else {
        console.log('❌ Pedido no encontrado o error de autenticación');
        let mensajeError = '';
        
        if (pedidoInfo.error === 'No autenticado. Por favor inicia sesión.') {
          mensajeError = `🔒 Para consultar tu pedido ${numeroPedido} de Supercasa, necesitas iniciar sesión primero.`;
        } else if (pedidoInfo.error === 'Sesión expirada. Por favor inicia sesión nuevamente.') {
          mensajeError = `⏰ Tu sesión expiró. Por favor inicia sesión nuevamente para consultar el pedido ${numeroPedido} de Supercasa.`;
        } else {
          mensajeError = `🔍 No encontré el pedido ${numeroPedido} en tu cuenta de Supercasa. Verifica el número o inicia sesión con la cuenta correcta.`;
        }
        
        setMensajes(prev => [...prev, { de: 'bot', texto: mensajeError }]);
        setIsLoading(false);
        return;
      }
    }

    console.log('🤖 No es pedido, continuando con lógica normal...');

    if (necesitaEscalamiento(textoUsuario)) {
      setMostrarSoporte(true);
    }

    // LÓGICA DE PRODUCTOS
    const cantidad = parseInt(textoLimpio);

    if (estadoConversacion.esperandoCantidad && estadoConversacion.productoPendiente && !isNaN(cantidad)) {
      for (let i = 0; i < cantidad; i++) {
        agregarAlCarrito(estadoConversacion.productoPendiente);
      }

      setMensajes((prev) => [
        ...prev,
        {
          de: 'bot',
          texto: `🏗️ ¡Listo! Agregué ${cantidad} ${estadoConversacion.productoPendiente.nombre} al carrito de Supercasa 🛒`,
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
          texto: `🏗️ ¡Perfecto! Tenemos ${productoDetectado.nombre} en Supercasa por $${productoDetectado.precio.toLocaleString()}. ¿Cuántos quieres agregar?`,
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
          texto: `🏗️ Tenemos ${productoDetectado.nombre} en Supercasa por $${productoDetectado.precio.toLocaleString()} 💰 ¿Te gustaría comprarlo?`,
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
          texto: '⚠️ Disculpa, tuve un problemita técnico en las Torres de Supercasa. ¿Puedes intentar de nuevo? 😅',
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

      {/* 🆕 BOTÓN DE WHATSAPP con branding Supercasa */}
      <a
        href="https://wa.me/573133592457?text=Hola%2C%20necesito%20soporte%20con%20mi%20pedido%20en%20Supercasa%20🏗️"
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-6 right-20 sm:right-28 text-white px-3 py-3 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110 ${
          darkMode 
            ? 'bg-green-700 hover:bg-green-800' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
        title="🏗️ Contactar Soporte Supercasa WhatsApp"
      >
        <span className="text-lg">📱</span>
      </a>

      {/* Botón flotante del chat con branding */}
      <button
        onClick={() => setVisible(!visible)}
        className={`fixed bottom-6 right-3 sm:right-6 text-white px-4 py-3 rounded-full shadow-lg z-50 transition-all duration-300 hover:scale-110 ${
          darkMode 
            ? 'bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800' 
            : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🏗️</span>
          <span className="hidden sm:inline text-sm font-medium">Chat Luna</span>
        </div>
      </button>

      {/* Chat modal con branding Supercasa */}
      {visible && (
        <div className={`fixed z-50 shadow-2xl rounded-xl border-2 flex flex-col transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-amber-600' 
            : 'bg-white border-amber-300'
        } ${
          'bottom-20 right-2 sm:right-6 w-[95vw] sm:w-96 md:w-80 max-w-sm h-[70vh] sm:h-96'
        }`}>
          {/* Header con branding */}
          <div className={`p-3 sm:p-4 font-semibold border-b-2 flex justify-between items-center transition-colors duration-300 rounded-t-xl ${
            darkMode 
              ? 'border-amber-600 text-white bg-gradient-to-r from-amber-700 to-yellow-800' 
              : 'border-amber-300 text-white bg-gradient-to-r from-amber-500 to-yellow-600'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🏗️</span>
              <span className="text-sm sm:text-base">Luna - Asistente Supercasa</span>
            </div>
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={limpiarChat}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  darkMode 
                    ? 'bg-amber-800 text-amber-200 hover:bg-amber-700' 
                    : 'bg-amber-400 text-amber-800 hover:bg-amber-300'
                }`}
                title="🏗️ Limpiar chat Supercasa"
              >
                🗑️
              </button>
              <button
                onClick={() => setVisible(false)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  darkMode 
                    ? 'bg-amber-800 text-amber-200 hover:bg-amber-700' 
                    : 'bg-amber-400 text-amber-800 hover:bg-amber-300'
                }`}
                title="Cerrar chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Mensajes con branding */}
          <div className="p-2 sm:p-3 overflow-y-auto space-y-3 text-sm flex-1">
            {mensajes.map((msg, i) => (
              <div
                key={i}
                className={`p-2 sm:p-3 rounded-lg border ${
                  msg.de === 'bot'
                    ? darkMode
                      ? 'bg-gray-700 text-gray-100 text-left border-amber-600/30'
                      : 'bg-amber-50 text-gray-800 text-left border-amber-200'
                    : darkMode
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-700 text-white text-right ml-4 sm:ml-6 border-amber-500'
                      : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 text-right ml-4 sm:ml-6 border-amber-300'
                }`}
              >
                {msg.texto}
              </div>
            ))}
            
            {/* Indicador de carga con branding */}
            {isLoading && (
              <div className={`p-2 sm:p-3 rounded-lg text-left border ${
                darkMode 
                  ? 'bg-gray-700 text-amber-300 border-amber-600/30' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-xs">🏗️ Consultando Supercasa...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input con branding */}
          <div className={`flex border-t-2 transition-colors duration-300 ${
            darkMode ? 'border-amber-600' : 'border-amber-300'
          }`}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`flex-1 p-2 sm:p-3 text-sm outline-none transition-colors duration-300 border-2 border-transparent focus:border-amber-500 ${
                darkMode 
                  ? 'bg-gray-800 text-white placeholder-amber-400' 
                  : 'bg-white text-gray-900 placeholder-amber-600'
              }`}
              placeholder="🏗️ Mensaje o SUP-123..."
              onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
              disabled={isLoading}
            />
            <button
              className={`px-3 sm:px-4 text-sm font-medium transition-colors duration-300 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : darkMode
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800'
                    : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700'
              } text-white shadow-lg`}
              onClick={enviarMensaje}
              disabled={isLoading}
              title="🏗️ Enviar a Supercasa"
            >
              {isLoading ? '⏳' : '🏗️'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}