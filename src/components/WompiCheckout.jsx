// src/components/WompiCheckout.jsx
// VERSIÓN PRODUCCIÓN FINAL - OPTIMIZADA Y LIMPIA

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const WompiCheckout = ({ 
  total, 
  carrito, 
  deliveryData, 
  onPaymentSuccess, 
  onPaymentError, 
  onCancel 
}) => {
  const [loading, setLoading] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [transactionReference, setTransactionReference] = useState('');
  const [showDaviPlataWait, setShowDaviPlataWait] = useState(false);
  const [daviPlataCountdown, setDaviPlataCountdown] = useState(120);
  const [isDaviPlataFlow, setIsDaviPlataFlow] = useState(false);

  // CLAVES WOMPI HARDCODEADAS - PRODUCCIÓN
  const WOMPI_PUBLIC_KEY = 'pub_prod_GkQ7DyAjNXb63f1Imr9OQ1YNHLXd89FT';
  const WOMPI_INTEGRITY_KEY = 'prod_integrity_70Ss0SPlsMMTT4uSx4zz85lOCTVtLKDa';
  const WOMPI_PRIVATE_KEY = 'prv_prod_bR8TUl71quylBwNiQcNn8OIFD1i9IdsR';
  const API_URL = process.env.REACT_APP_API_URL || 
                  window.REACT_APP_API_URL || 
                  'https://supercasa-backend-vvu1.onrender.com';

  // INTERCEPTACIÓN PARA SOLUCIONAR merchants/undefined
  useEffect(() => {
    // Interceptar constructor de URL para bloquear merchants/undefined
    const originalURL = window.URL;
    window.URL = function(url, base) {
      if (url && url.includes('merchants/undefined')) {
        url = url.replace('merchants/undefined', 'merchants/' + WOMPI_PUBLIC_KEY);
      }
      return new originalURL(url, base);
    };
    
    // Copiar propiedades estáticas
    Object.setPrototypeOf(window.URL, originalURL);
    Object.getOwnPropertyNames(originalURL).forEach(name => {
      if (name !== 'length' && name !== 'name' && name !== 'prototype') {
        try {
          Object.defineProperty(window.URL, name, 
            Object.getOwnPropertyDescriptor(originalURL, name)
          );
        } catch (e) {}
      }
    });
    
    // Interceptar string operations para merchants/undefined
    const originalStringConcat = String.prototype.concat;
    String.prototype.concat = function(...args) {
      const result = originalStringConcat.apply(this, args);
      if (result.includes('merchants/undefined')) {
        return result.replace('merchants/undefined', 'merchants/' + WOMPI_PUBLIC_KEY);
      }
      return result;
    };
    
    // Patch WOMPI config si existe
    const patchWompiConfig = () => {
      if (window.$wompi && window.$wompi.config) {
        if (!window.$wompi.config.publicKey || window.$wompi.config.publicKey === 'undefined') {
          window.$wompi.config.publicKey = WOMPI_PUBLIC_KEY;
        }
      }
    };
    
    // Ejecutar patch cada 100ms por 10 segundos
    let patchAttempts = 0;
    const patchInterval = setInterval(() => {
      patchWompiConfig();
      patchAttempts++;
      if (patchAttempts >= 100) {
        clearInterval(patchInterval);
      }
    }, 100);

    return () => {
      clearInterval(patchInterval);
      window.URL = originalURL;
      String.prototype.concat = originalStringConcat;
    };
  }, []);

  // Contador DaviPlata
  useEffect(() => {
    let interval;
    if (showDaviPlataWait && daviPlataCountdown > 0) {
      interval = setInterval(() => {
        setDaviPlataCountdown(prev => {
          if (prev <= 1) {
            setShowDaviPlataWait(false);
            startPolling(transactionReference);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showDaviPlataWait, daviPlataCountdown, transactionReference]);

  // Verificar claves WOMPI
  const verifyWompiKeys = async () => {
    try {
      const response = await fetch(`https://api.wompi.co/v1/merchants/${WOMPI_PUBLIC_KEY}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Verificar estado de transacción
  const checkTransactionStatus = async (reference) => {
    try {
      // Verificar en WOMPI directamente
      try {
        const wompiResponse = await fetch(`https://api.wompi.co/v1/transactions/${reference}`, {
          headers: {
            'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
            'Accept': 'application/json'
          }
        });
        
        if (wompiResponse.ok) {
          const wompiData = await wompiResponse.json();
          const status = wompiData.data?.status;
          
          if (status === 'APPROVED') {
            await createOrder({
              reference: wompiData.data.reference || reference,
              status: 'APPROVED',
              payment_method: { type: wompiData.data.payment_method_type || 'WOMPI' },
              id: reference,
              amount_in_cents: wompiData.data.amount_in_cents || (total * 100)
            });
            return true;
          } else if (status === 'DECLINED') {
            setPollingActive(false);
            setLoading(false);
            setShowDaviPlataWait(false);
            setIsDaviPlataFlow(false);
            toast.error('Pago rechazado');
            return true;
          }
        }
      } catch (wompiError) {
        // Continuar con backend
      }
      
      // Verificar en backend
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/verificar-pago/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'APPROVED') {
          if (data.pedidoId) {
            setPollingActive(false);
            setLoading(false);
            setShowDaviPlataWait(false);
            setIsDaviPlataFlow(false);
            localStorage.removeItem('carrito');
            toast.success('¡Pago confirmado! Tu pedido será entregado en máximo 20 minutos.');
            setTimeout(() => { window.location.href = '/'; }, 2000);
          } else {
            await createOrder({
              reference: data.reference || reference,
              status: 'APPROVED',
              payment_method: { type: 'BACKEND_VERIFIED' },
              id: reference,
              amount_in_cents: total * 100
            });
          }
          return true;
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };

  // Iniciar polling
  const startPolling = (reference) => {
    setPollingActive(true);
    setPollingAttempts(0);
    setTransactionReference(reference);
    setShowDaviPlataWait(false);

    const pollInterval = setInterval(async () => {
      if (!pollingActive) {
        clearInterval(pollInterval);
        return;
      }

      // Verificar pedido reciente
      try {
        const token = localStorage.getItem('token');
        const pedidoRecenteResponse = await fetch(`${API_URL}/api/verificar-pedido-reciente`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (pedidoRecenteResponse.ok) {
          const pedidoData = await pedidoRecenteResponse.json();
          if (pedidoData.found && pedidoData.payment_status === 'APPROVED') {
            clearInterval(pollInterval);
            setPollingActive(false);
            setLoading(false);
            setShowDaviPlataWait(false);
            setIsDaviPlataFlow(false);
            localStorage.removeItem('carrito');
            toast.success(`¡Pago confirmado! Pedido ${pedidoData.pedidoId} creado exitosamente.`, { duration: 4000 });
            setTimeout(() => { window.location.href = '/'; }, 2000);
            return;
          }
        }
      } catch (error) {
        // Continuar
      }

      const completed = await checkTransactionStatus(reference);
      setPollingAttempts(prev => prev + 1);

      if (completed || pollingAttempts >= 60) {
        clearInterval(pollInterval);
        setPollingActive(false);
        if (pollingAttempts >= 60 && !completed) {
          showPaymentSuccessCheck(reference);
        }
      }
    }, 3000);

    return () => {
      clearInterval(pollInterval);
      setPollingActive(false);
    };
  };

  // Manejar cierre de widget
  const handleWidgetClose = (result, reference) => {
    if (result && result.transaction) {
      const transactionId = result.transaction.id;
      if (result.transaction.status === 'APPROVED') {
        createOrder(result.transaction);
      } else {
        startPolling(transactionId);
      }
      return;
    }

    if (result && result.error) {
      toast.error('Error en el procesamiento del pago');
      if (onPaymentError) onPaymentError(result.error);
      return;
    }

    // Detectar DaviPlata por tiempo de widget
    const widgetOpenTime = Date.now() - window.widgetOpenTimestamp;
    const isPossibleDaviPlata = widgetOpenTime < 60000;
    
    if (isPossibleDaviPlata) {
      setIsDaviPlataFlow(true);
      setShowDaviPlataWait(true);
      setDaviPlataCountdown(120);
      setTransactionReference(reference);
      setLoading(false);
    } else {
      startPolling(reference);
    }
  };

  // DaviPlata ready
  const handleDaviPlataReady = () => {
    setShowDaviPlataWait(false);
    setTimeout(() => startPolling(transactionReference), 100);
    
    let backupAttempts = 0;
    const backupInterval = setInterval(async () => {
      backupAttempts++;
      const completed = await checkTransactionStatus(transactionReference);
      if (completed || backupAttempts >= 15) {
        clearInterval(backupInterval);
      }
    }, 2000);
    
    toast.success('🚀 Verificando tu pago DaviPlata cada 2 segundos...', { duration: 4000 });
  };

  // Cancelar DaviPlata
  const handleCancelDaviPlata = () => {
    setShowDaviPlataWait(false);
    setIsDaviPlataFlow(false);
    setTransactionReference('');
    setLoading(false);
    setPollingActive(false);
    toast.error('❌ Pago cancelado. Si ya pagaste en DaviPlata, usa "Verificar pago manualmente".', { duration: 8000 });
  };

  // Verificación manual
  const showPaymentSuccessCheck = async (reference) => {
    const userConfirm = window.confirm(
      '🤔 ¿Tu pago fue procesado exitosamente?\n\n' +
      '⚠️ IMPORTANTE: Solo confirma si recibiste notificación de pago exitoso.\n' +
      'Verificaremos en WOMPI antes de crear tu pedido.'
    );

    if (userConfirm) {
      await showManualConfirmation(reference);
    } else {
      toast.error('Si el dinero fue debitado, contacta soporte. Tu pedido será procesado automáticamente si el pago fue exitoso.', { duration: 8000 });
      if (onPaymentError) onPaymentError({ status: 'USER_CANCELLED' });
    }
  };

  // Crear pedido
  const createOrder = async (paymentData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Error: Token de autenticación no encontrado');
        setLoading(false);
        return;
      }

      const pedidoData = {
        productos: carrito,
        total: total,
        ...deliveryData,
        payment_reference: paymentData.reference || paymentData.id,
        payment_status: paymentData.status || 'APPROVED',
        payment_method: paymentData.payment_method?.type || 'WOMPI',
        payment_transaction_id: paymentData.id,
        payment_amount_cents: paymentData.amount_in_cents || (total * 100)
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pedidoData)
      });

      if (response.ok) {
        localStorage.removeItem('carrito');
        setLoading(false);
        setPollingActive(false);
        setShowDaviPlataWait(false);
        setIsDaviPlataFlow(false);
        toast.success('¡Pedido creado exitosamente! Redirigiendo...', { duration: 3000 });
        setTimeout(() => { window.location.href = '/'; }, 2000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al crear el pedido');
        setLoading(false);
      }
    } catch (error) {
      toast.error('Error al procesar el pedido');
      setLoading(false);
    }
  };

  // Confirmación manual
  const showManualConfirmation = async (reference) => {
    const userConfirm = window.confirm('¿Tu pago fue procesado exitosamente?\n\nVerificaremos el estado real en WOMPI.');

    if (userConfirm) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/verificar-pago/${reference}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'APPROVED') {
            localStorage.removeItem('carrito');
            toast.success('¡Pago confirmado! Tu pedido está en proceso.', { duration: 3000 });
            setTimeout(() => { window.location.href = '/'; }, 2000);
          } else {
            toast.error('Pago no confirmado en WOMPI. Si pagaste, espera unos minutos.', { duration: 6000 });
          }
        }
      } catch (error) {
        toast.error('Error verificando pago.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Calcular signature
  const calculateSignature = async (reference, amountInCents) => {
    try {
      const message = `${reference}${amountInCents}COP${WOMPI_INTEGRITY_KEY}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      throw error;
    }
  };

  // Esperar WOMPI
  const waitForWompi = () => {
    return new Promise((resolve) => {
      const checkWompi = () => {
        if (window.WidgetCheckout) {
          resolve(true);
        } else {
          setTimeout(checkWompi, 200);
        }
      };
      
      setTimeout(() => {
        if (!window.WidgetCheckout) {
          loadWompiDynamically().then(() => resolve(true));
        } else {
          resolve(true);
        }
      }, 20000);
      
      checkWompi();
    });
  };

  // Cargar WOMPI dinámicamente
  const loadWompiDynamically = () => {
    return new Promise((resolve) => {
      if (window.WidgetCheckout) {
        resolve();
        return;
      }

      // Proteger antes de cargar
      if (window.$wompi && !window.$wompi._protected) {
        const originalInitialize = window.$wompi.initialize;
        window.$wompi.initialize = function(publicKey) {
          if (!publicKey || publicKey === 'undefined' || publicKey === 'null') {
            return Promise.resolve({ data: { sessionId: 'blocked_pre_load_' + Date.now() } });
          }
          return originalInitialize.call(this, publicKey);
        };
        window.$wompi._protected = true;
      }
      
      // Interceptar fetch para merchants/undefined
      const originalFetch = window.fetch;
      window.fetch = function(url, options = {}) {
        if (url && url.includes('merchants/undefined')) {
          return Promise.reject(new Error('Blocked undefined merchant call'));
        }
        return originalFetch.call(this, url, options);
      };
      
      // Interceptar XMLHttpRequest
      const originalXMLHttpRequest = window.XMLHttpRequest;
      window.XMLHttpRequest = function() {
        const xhr = new originalXMLHttpRequest();
        const originalOpen = xhr.open;
        
        xhr.open = function(method, url, ...args) {
          if (url && url.includes('merchants/undefined')) {
            this.readyState = 4;
            this.status = 200;
            this.responseText = '{"data": {"status": "blocked"}}';
            if (this.onreadystatechange) {
              setTimeout(() => this.onreadystatechange(), 0);
            }
            return;
          }
          return originalOpen.apply(this, [method, url, ...args]);
        };
        
        return xhr;
      };
      
      const script = document.createElement('script');
      script.src = 'https://checkout.wompi.co/widget.js';
      script.type = 'text/javascript';
      
      script.onload = () => {
        // Protección post-carga
        if (window.$wompi && window.$wompi.initialize && !window.$wompi._protected) {
          const originalInitialize = window.$wompi.initialize;
          window.$wompi.initialize = function(publicKey) {
            if (!publicKey || publicKey === 'undefined' || publicKey === 'null' || publicKey !== WOMPI_PUBLIC_KEY) {
              return Promise.resolve({ data: { sessionId: 'blocked_post_load_' + Date.now() } });
            }
            return originalInitialize.call(this, publicKey);
          };
          window.$wompi._protected = true;
        }
        
        setTimeout(() => {
          resolve();
        }, 1000);
      };
      
      script.onerror = () => {
        window.fetch = originalFetch;
        window.XMLHttpRequest = originalXMLHttpRequest;
        resolve();
      };
      
      document.head.appendChild(script);
    });
  };

  // Inicializar pago
  const initializePayment = async () => {
    try {
      setLoading(true);
      setShowDaviPlataWait(false);
      setIsDaviPlataFlow(false);

      // Verificar claves
      const keysValid = await verifyWompiKeys();
      if (!keysValid) {
        console.warn('Claves no verificadas, continuando...');
      }

      // Esperar WOMPI
      await waitForWompi();

      // Generar referencia
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
      const randomNumber = Math.floor(Math.random() * 9000) + 1000;
      const reference = `SC-000-${timestamp}-${randomString}-${randomNumber}`;

      // Guardar carrito temporal
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/api/guardar-carrito-temporal`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            referencia: reference,
            productos: carrito,
            datos_entrega: deliveryData
          })
        });
      } catch (carritoError) {
        // Continuar aunque falle
      }

      const amountInCents = total * 100;
      const signature = await calculateSignature(reference, amountInCents);

      // Datos del cliente
      const phoneNumber = deliveryData.telefono_contacto || '3001234567';
      const cleanPhoneNumber = phoneNumber.replace(/^\+57/, '');

      // Configuración del widget
      const widgetConfig = {
        currency: 'COP',
        amountInCents: amountInCents,
        reference: reference,
        publicKey: WOMPI_PUBLIC_KEY,
        signature: { integrity: signature },
        redirectUrl: window.location.origin,
        customerData: {
          email: deliveryData.email || 'cliente@supercasa.com',
          fullName: deliveryData.nombre || 'Cliente Supercasa',
          phoneNumber: cleanPhoneNumber,
          phoneNumberPrefix: '+57'
        }
      };

      // Inicializar widget
      let checkout;
      try {
        checkout = new window.WidgetCheckout(widgetConfig);
      } catch (initError) {
        checkout = new window.WidgetCheckout({
          currency: 'COP',
          amountInCents: amountInCents,
          reference: reference,
          publicKey: WOMPI_PUBLIC_KEY,
          signature: { integrity: signature }
        });
      }
      
      // Abrir widget
      window.widgetOpenTimestamp = Date.now();
      
      const widgetPromise = new Promise((resolve, reject) => {
        try {
          checkout.open(function(result) {
            resolve(result);
          });
        } catch (openError) {
          reject(openError);
        }
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout abriendo widget')), 300000);
      });

      const result = await Promise.race([widgetPromise, timeoutPromise]);
      setLoading(false);
      handleWidgetClose(result, reference);

    } catch (error) {
      setLoading(false);
      setShowDaviPlataWait(false);
      setIsDaviPlataFlow(false);
      
      if (error.message.includes('Timeout')) {
        toast.error('El widget tardó mucho en cargar. Intenta de nuevo.');
      } else {
        toast.error('Error al inicializar el pago: ' + error.message);
      }
      
      if (onPaymentError) onPaymentError(error);
    }
  };

  return (
    <div className="wompi-checkout">
      <button
        onClick={initializePayment}
        disabled={loading || pollingActive || showDaviPlataWait}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300
          ${loading || pollingActive || showDaviPlataWait
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {loading && '🔄 Inicializando pago WOMPI...'}
        {pollingActive && '🔍 Verificando pago automáticamente...'}
        {showDaviPlataWait && '📱 Esperando confirmación DaviPlata...'}
        {!loading && !pollingActive && !showDaviPlataWait && '💳 Pagar con WOMPI'}
      </button>

      {/* Estado DaviPlata */}
      {showDaviPlataWait && (
        <div className="mt-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-3xl animate-pulse">📱</span>
            <div className="flex-1">
              <h3 className="font-bold text-amber-800 text-lg">🚨 DaviPlata Detectado</h3>
              <p className="text-amber-700 text-sm">
                ⏰ Esperando <strong>{daviPlataCountdown} segundos</strong> para que completes tu pago
              </p>
              <div className="w-full bg-amber-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-amber-600 h-2 rounded-full transition-all duration-1000" 
                  style={{width: `${(daviPlataCountdown / 120) * 100}%`}}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <button
              onClick={handleDaviPlataReady}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 font-bold shadow-lg"
            >
              ✅ YA PAGUÉ - VERIFICAR INMEDIATAMENTE
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => startPolling(transactionReference)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 font-medium"
              >
                🔍 Verificar Ahora
              </button>
              
              <button
                onClick={handleCancelDaviPlata}
                className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 font-medium"
              >
                ❌ Cancelar Todo
              </button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-100 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>📱 PASOS DAVIPLATA:</strong><br/>
              1️⃣ Abre tu app DaviPlata<br/>
              2️⃣ Autoriza el pago con tu PIN<br/>
              3️⃣ Espera confirmación en DaviPlata<br/>
              4️⃣ ¡Regresa aquí y presiona "YA PAGUÉ"!
            </p>
          </div>
        </div>
      )}

      {/* Estado polling */}
      {pollingActive && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-blue-700 font-medium">
              Verificando pago automáticamente... (Intento {pollingAttempts + 1}/60)
            </span>
          </div>
          <p className="text-blue-600 text-sm mt-2">
            Completa tu pago en Nequi/PSE/DaviPlata. El sistema detectará automáticamente cuando se apruebe.
          </p>
          
          {pollingAttempts > 10 && (
            <button
              onClick={() => showManualConfirmation(transactionReference)}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              ⚡ Confirmar pago manualmente
            </button>
          )}
          
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>Tu pago está protegido:</strong><br/>
              • Si pagaste, recibirás tu pedido automáticamente<br/>
              • Nuestro sistema verifica pagos cada 3 segundos<br/>
              • En caso de dudas, contacta soporte
            </p>
          </div>
        </div>
      )}

      {/* Botón cancelar */}
      {!loading && !pollingActive && !showDaviPlataWait && onCancel && (
        <button
          onClick={onCancel}
          className="mt-3 w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </button>
      )}
    </div>
  );
};

export default WompiCheckout;