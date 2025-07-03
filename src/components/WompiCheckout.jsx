// src/components/WompiCheckout.jsx
// VERSIÓN DEFINITIVA CON SOLUCIÓN DAVIPLATA

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
  
  // 🆕 NUEVO: Estados específicos para DaviPlata - MÁS AGRESIVO
  const [showDaviPlataWait, setShowDaviPlataWait] = useState(false);
  const [daviPlataCountdown, setDaviPlataCountdown] = useState(120); // ⚡ AUMENTADO A 2 MINUTOS
  const [isDaviPlataFlow, setIsDaviPlataFlow] = useState(false);

  // ✅ CONFIGURACIÓN WOMPI PRODUCCIÓN
  const WOMPI_PUBLIC_KEY = process.env.REACT_APP_WOMPI_PUBLIC_KEY || 'pub_prod_GkQ7DyAjNXb63f1Imr9OQ1YNHLXd89FT';
  const WOMPI_INTEGRITY_KEY = process.env.REACT_APP_WOMPI_INTEGRITY_KEY || 'prod_integrity_70Ss0SPlsMMTT4uSx4zz85lOCTVtLKDa';
  const WOMPI_PRIVATE_KEY = process.env.REACT_APP_WOMPI_PRIVATE_KEY || 'prv_prod_bR8TUl71quylBwNiQcNn8OIFD1i9IdsR';
  const API_URL = process.env.REACT_APP_API_URL || 'https://supercasa-backend-vvu1.onrender.com';

  // 🔍 DEBUG: Verificar variables al montar
  useEffect(() => {
    console.log('🔑 Variables WOMPI:', {
      public_key: WOMPI_PUBLIC_KEY.substring(0, 15) + '...',
      integrity_key: WOMPI_INTEGRITY_KEY.substring(0, 15) + '...',
      private_key: WOMPI_PRIVATE_KEY.substring(0, 15) + '...',
      env_public: process.env.REACT_APP_WOMPI_PUBLIC_KEY ? 'OK' : 'MISSING',
      env_integrity: process.env.REACT_APP_WOMPI_INTEGRITY_KEY ? 'OK' : 'MISSING',
      env_private: process.env.REACT_APP_WOMPI_PRIVATE_KEY ? 'OK' : 'MISSING'
    });
  }, []);

  // 🆕 NUEVO: Contador DaviPlata
  useEffect(() => {
    let interval;
    if (showDaviPlataWait && daviPlataCountdown > 0) {
      interval = setInterval(() => {
        setDaviPlataCountdown(prev => {
          if (prev <= 1) {
            setShowDaviPlataWait(false);
            console.log('⏰ Tiempo de espera DaviPlata terminado, iniciando polling normal');
            startPolling(transactionReference);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showDaviPlataWait, daviPlataCountdown, transactionReference]);

  // 🔍 VERIFICAR CLAVES WOMPI ANTES DE PROCEDER
  const verifyWompiKeys = async () => {
    try {
      console.log('🔍 Verificando claves WOMPI con la API...');
      
      // Verificar clave pública con endpoint público
      const response = await fetch(`https://api.wompi.co/v1/merchants/${WOMPI_PUBLIC_KEY}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Claves WOMPI verificadas exitosamente:', data.data?.name || 'Merchant válido');
        return true;
      } else {
        console.log(`⚠️ Verificación de claves falló: ${response.status} - ${response.statusText}`);
        return false;
      }
    } catch (error) {
      console.log('⚠️ Error verificando claves WOMPI:', error);
      return false; // Continuar anyway
    }
  };

  const checkTransactionStatus = async (reference) => {
    try {
      console.log(`🔍 Verificando transacción: ${reference} (Intento ${pollingAttempts + 1})`);
      
      // 🆕 VERIFICAR PRIMERO EN WOMPI DIRECTAMENTE
      try {
        const wompiResponse = await fetch(`https://api.wompi.co/v1/transactions/${reference}`, {
          headers: {
            'Authorization': `Bearer prv_prod_bR8TUl71quylBwNiQcNn8OIFD1i9IdsR`,
            'Accept': 'application/json'
          }
        });
        
        if (wompiResponse.ok) {
          const wompiData = await wompiResponse.json();
          const status = wompiData.data?.status;
          
          console.log('📊 Estado en WOMPI:', status);
          
          if (status === 'APPROVED') {
            console.log('✅ ¡PAGO CONFIRMADO EN WOMPI! Creando pedido...');
            
            // ✅ CREAR PEDIDO INMEDIATAMENTE
            await createOrder({
              reference: wompiData.data.reference || reference,
              status: 'APPROVED',
              payment_method: { type: wompiData.data.payment_method_type || 'WOMPI' },
              id: reference,
              amount_in_cents: wompiData.data.amount_in_cents || (total * 100)
            });
            
            return true;
            
          } else if (status === 'DECLINED') {
            console.log('❌ Pago rechazado en WOMPI');
            setPollingActive(false);
            setLoading(false);
            // 🆕 LIMPIAR estados DaviPlata
            setShowDaviPlataWait(false);
            setIsDaviPlataFlow(false);
            toast.error('Pago rechazado');
            return true;
            
          } else {
            console.log(`⏳ Estado en WOMPI: ${status} - Continuando...`);
            return false;
          }
        }
      } catch (wompiError) {
        console.log('⚠️ Error consultando WOMPI:', wompiError);
      }
      
      // 🔄 FALLBACK: Verificar en nuestro backend  
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
        console.log('📊 Respuesta backend:', data);
        
        if (data.status === 'APPROVED') {
          console.log('✅ Pago confirmado en backend');
          
          if (data.pedidoId) {
            // Ya existe pedido
            setPollingActive(false);
            setLoading(false);
            // 🆕 LIMPIAR estados DaviPlata
            setShowDaviPlataWait(false);
            setIsDaviPlataFlow(false);
            localStorage.removeItem('carrito');
            
            toast.success('¡Pago confirmado! Tu pedido será entregado en máximo 20 minutos.');
            
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
          } else {
            // Crear pedido
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
      console.log('⚠️ Error en polling:', error);
      return false;
    }
  };

  const startPolling = (reference) => {
    console.log('🔄 Iniciando polling MEJORADO para:', reference);
    setPollingActive(true);
    setPollingAttempts(0);
    setTransactionReference(reference);
    // 🆕 LIMPIAR estados DaviPlata al iniciar polling
    setShowDaviPlataWait(false);

    const pollInterval = setInterval(async () => {
      if (!pollingActive) {
        clearInterval(pollInterval);
        return;
      }

      // 🆕 VERIFICAR PRIMERO SI YA EXISTE UN PEDIDO RECIENTE
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
            console.log('🎉 ¡PEDIDO CREADO POR WEBHOOK DETECTADO!', pedidoData);
            
            // ✅ LIMPIAR TODO INMEDIATAMENTE
            clearInterval(pollInterval);
            setPollingActive(false);
            setLoading(false);
            // 🆕 LIMPIAR estados DaviPlata
            setShowDaviPlataWait(false);
            setIsDaviPlataFlow(false);
            localStorage.removeItem('carrito');
            
            toast.success(`¡Pago confirmado! Pedido ${pedidoData.pedidoId} creado exitosamente.`, {
              duration: 4000
            });
            
            // ✅ REDIRECCIONAR PARA LIMPIAR CARRITO
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
            
            return;
          }
        }
      } catch (error) {
        console.log('⚠️ Error verificando pedido reciente:', error);
      }

      // ✅ SI NO HAY PEDIDO RECIENTE, VERIFICAR TRANSACCIÓN NORMAL
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

  // 🆕 NUEVO: Manejar cierre de widget con lógica DaviPlata
  const handleWidgetClose = (result, reference) => {
    console.log('🔍 Analizando cierre de widget:', result);
    
    // Si ya hay resultado de transacción, procesar normalmente
    if (result && result.transaction) {
      console.log('✅ Transacción detectada en callback:', result.transaction);
      
      const transactionId = result.transaction.id;
      const transactionRef = result.transaction.reference;
      
      console.log('🆔 ID real de WOMPI:', transactionId);
      console.log('🔗 Nuestra referencia:', transactionRef);
      
      if (result.transaction.status === 'APPROVED') {
        console.log('🎉 ¡PAGO YA APROBADO! Creando pedido inmediatamente...');
        createOrder(result.transaction);
      } else {
        console.log('⏳ Estado:', result.transaction.status, '- Iniciando polling con ID real');
        startPolling(transactionId);
      }
      return;
    }

    // Si hay error, manejarlo
    if (result && result.error) {
      console.error('❌ Error en widget:', result.error);
      toast.error('Error en el procesamiento del pago');
      if (onPaymentError) onPaymentError(result.error);
      return;
    }

    // 🆕 NUEVO: Widget cerrado sin información clara - LÓGICA DAVIPLATA MÁS AGRESIVA
    console.log('⚠️ Widget cerrado sin información clara');
    
    // ⚡ DETECCIÓN MÁS AGRESIVA: Widget cerrado dentro de 60 segundos = posible DaviPlata
    const widgetOpenTime = Date.now() - window.widgetOpenTimestamp;
    const isPossibleDaviPlata = widgetOpenTime < 60000; // ⚡ AUMENTADO A 60 SEGUNDOS
    
    if (isPossibleDaviPlata) {
      console.log('📱 DETECCIÓN AGRESIVA: Posible flujo DaviPlata - Activando espera extendida');
      setIsDaviPlataFlow(true);
      setShowDaviPlataWait(true);
      setDaviPlataCountdown(120); // ⚡ 2 MINUTOS DE ESPERA
      setTransactionReference(reference);
      setLoading(false);
    } else {
      // Widget abierto por más tiempo, probablemente no es DaviPlata
      console.log('🔄 Iniciando polling preventivo normal (widget abierto > 60s)');
      startPolling(reference);
    }
  };

  // 🆕 NUEVO: Función ULTRA AGRESIVA para DaviPlata
  const handleDaviPlataReady = () => {
    console.log('📱 USUARIO CONFIRMÓ PAGO DAVIPLATA - VERIFICACIÓN ULTRA AGRESIVA');
    setShowDaviPlataWait(false);
    
    // ⚡ VERIFICACIÓN INMEDIATA MÚLTIPLE
    setTimeout(() => startPolling(transactionReference), 100);
    
    // ⚡ VERIFICACIÓN BACKUP cada 2 segundos por 30 segundos
    let backupAttempts = 0;
    const backupInterval = setInterval(async () => {
      backupAttempts++;
      console.log(`🔄 Verificación backup DaviPlata #${backupAttempts}`);
      
      const completed = await checkTransactionStatus(transactionReference);
      if (completed || backupAttempts >= 15) {
        clearInterval(backupInterval);
      }
    }, 2000);
    
    toast.success('🚀 Verificando tu pago DaviPlata cada 2 segundos...', {
      duration: 4000
    });
  };

  // 🆕 NUEVO: Función para cancelar espera DaviPlata - MEJORADA
  const handleCancelDaviPlata = () => {
    console.log('❌ Usuario canceló flujo DaviPlata - LIMPIANDO TODO');
    setShowDaviPlataWait(false);
    setIsDaviPlataFlow(false);
    setTransactionReference('');
    setLoading(false);
    setPollingActive(false);
    
    toast.error('❌ Pago cancelado. Si ya pagaste en DaviPlata, usa "Verificar pago manualmente".', {
      duration: 8000
    });
  };

  // 🔍 VERIFICACIÓN MANUAL INTELIGENTE Y SEGURA - REEMPLAZAR
  const showPaymentSuccessCheck = async (reference) => {
    const userConfirm = window.confirm(
      '🤔 ¿Tu pago fue procesado exitosamente?\n\n' +
      '⚠️ IMPORTANTE: Solo confirma si recibiste notificación de pago exitoso.\n' +
      'Verificaremos en WOMPI antes de crear tu pedido.'
    );

    if (userConfirm) {
      // Usar la misma función segura
      await showManualConfirmation(reference);
    } else {
      console.log('❌ Usuario indicó que el pago falló');
      toast.error('Si el dinero fue debitado, contacta soporte. Tu pedido será procesado automáticamente si el pago fue exitoso.', {
        duration: 8000
      });
      
      if (onPaymentError) onPaymentError({ status: 'USER_CANCELLED' });
    }
  };

  const createOrder = async (paymentData) => {
    try {
      console.log('💳 PAGO EXITOSO CONFIRMADO:', paymentData);

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
        const result = await response.json();
        console.log('🎉 ¡PEDIDO CREADO EXITOSAMENTE!', result);
        
        // ✅ LIMPIAR TODO
        localStorage.removeItem('carrito');
        setLoading(false);
        setPollingActive(false);
        // 🆕 LIMPIAR estados DaviPlata
        setShowDaviPlataWait(false);
        setIsDaviPlataFlow(false);
        
        toast.success('¡Pedido creado exitosamente! Redirigiendo...', {
          duration: 3000
        });
        
        // ✅ FORZAR RECARGA PARA LIMPIAR CARRITO
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        
      } else {
        const errorData = await response.json();
        console.error('❌ Error al crear pedido:', errorData);
        toast.error(errorData.error || 'Error al crear el pedido');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error en createOrder:', error);
      toast.error('Error al procesar el pedido');
      setLoading(false);
    }
  };

  const showManualConfirmation = async (reference) => {
    const userConfirm = window.confirm(
      '¿Tu pago fue procesado exitosamente?\n\n' +
      'Verificaremos el estado real en WOMPI.'
    );

    if (userConfirm) {
      console.log('✅ Usuario confirmó pago - Verificando...');
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
            console.log('✅ CONFIRMADO: Pago real en WOMPI');
            
            // ✅ LIMPIAR Y REDIRECCIONAR INMEDIATAMENTE
            localStorage.removeItem('carrito');
            
            toast.success('¡Pago confirmado! Tu pedido está en proceso.', {
              duration: 3000
            });
            
            setTimeout(() => {
              window.location.href = '/';
            }, 2000);
            
          } else {
            toast.error('Pago no confirmado en WOMPI. Si pagaste, espera unos minutos.', {
              duration: 6000
            });
          }
        }
        
      } catch (error) {
        console.error('❌ Error verificando pago:', error);
        toast.error('Error verificando pago.');
      } finally {
        setLoading(false);
      }
    }
  };

  // 🔐 CALCULAR SIGNATURE
  const calculateSignature = async (reference, amountInCents) => {
    try {
      const message = `${reference}${amountInCents}COP${WOMPI_INTEGRITY_KEY}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
      
      console.log('🔐 Signature calculada:', hashHex.substring(0, 10) + '...');
      return hashHex;
    } catch (error) {
      console.error('❌ Error calculando signature:', error);
      throw error;
    }
  };

  // 🔄 ESPERAR CARGA COMPLETA DE WOMPI - VERSIÓN CON TIMEOUT EXTENDIDO
  const waitForWompi = () => {
    return new Promise((resolve) => {
      const checkWompi = () => {
        console.log('🔍 Verificando WOMPI:', {
          WidgetCheckout: typeof window.WidgetCheckout,
          $wompi: typeof window.$wompi,
          scripts: document.querySelectorAll('script[src*="wompi"]').length
        });
        
        if (window.WidgetCheckout) {
          console.log('✅ WOMPI Widget disponible');
          resolve(true);
        } else {
          console.log('⏳ Esperando WidgetCheckout...');
          setTimeout(checkWompi, 200);
        }
      };
      
      // Timeout de seguridad extendido: 20 segundos
      setTimeout(() => {
        console.log('⚠️ Timeout extendido de WOMPI - Intentando cargar dinámicamente');
        if (!window.WidgetCheckout) {
          loadWompiDynamically().then(() => resolve(true));
        } else {
          resolve(true);
        }
      }, 20000);
      
      checkWompi();
    });
  };

  // 📥 CARGAR WOMPI DINÁMICAMENTE SI NO ESTÁ
  const loadWompiDynamically = () => {
    return new Promise((resolve) => {
      if (window.WidgetCheckout) {
        resolve();
        return;
      }

      console.log('📥 Cargando script WOMPI dinámicamente...');
      const script = document.createElement('script');
      script.src = 'https://checkout.wompi.co/widget.js';
      script.type = 'text/javascript';
      
      script.onload = () => {
        console.log('✅ Script WOMPI cargado dinámicamente');
        // Esperar un poco más para que se inicialice
        setTimeout(() => {
          if (window.WidgetCheckout) {
            console.log('✅ WidgetCheckout disponible después de carga dinámica');
          } else {
            console.log('⚠️ WidgetCheckout aún no disponible - continuando anyway');
          }
          resolve();
        }, 1000);
      };
      
      script.onerror = () => {
        console.log('❌ Error cargando script WOMPI dinámicamente');
        resolve(); // Continuar anyway
      };
      
      document.head.appendChild(script);
    });
  };

  // ✅ INICIALIZAR PAGO CON WOMPI - VERSIÓN ULTRA ROBUSTA
  const initializePayment = async () => {
    try {
      console.log('🚀 INICIANDO PAGO CON POLLING AUTOMÁTICO');
      setLoading(true);
      // 🆕 LIMPIAR estados DaviPlata al iniciar nuevo pago
      setShowDaviPlataWait(false);
      setIsDaviPlataFlow(false);

      // 🔑 VALIDAR CLAVES MÁS ESTRICTO
      if (!WOMPI_PUBLIC_KEY || WOMPI_PUBLIC_KEY.includes('undefined') || !WOMPI_PUBLIC_KEY.startsWith('pub_prod_')) {
        throw new Error(`Clave pública de WOMPI inválida: ${WOMPI_PUBLIC_KEY}`);
      }

      if (!WOMPI_INTEGRITY_KEY || !WOMPI_INTEGRITY_KEY.startsWith('prod_integrity_')) {
        throw new Error(`Clave de integridad WOMPI inválida: ${WOMPI_INTEGRITY_KEY}`);
      }

      console.log('✅ Claves WOMPI validadas correctamente');

      // 🔍 VERIFICAR CLAVES CON LA API
      const keysValid = await verifyWompiKeys();
      if (!keysValid) {
        console.log('⚠️ Claves no verificadas, continuando con precaución...');
      }

      // ⏳ ESPERAR CARGA COMPLETA CON TIMEOUT EXTENDIDO
      await waitForWompi();

      // 🔗 GENERAR REFERENCIA ÚNICA
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
      const randomNumber = Math.floor(Math.random() * 9000) + 1000;
      const reference = `SC-000-${timestamp}-${randomString}-${randomNumber}`;

      // 💾 NUEVO: GUARDAR CARRITO TEMPORAL ANTES DEL PAGO
      console.log('💾 Guardando carrito temporal...');
      try {
        const token = localStorage.getItem('token');
        const carritoResponse = await fetch(`${API_URL}/api/guardar-carrito-temporal`, {
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
        
        if (carritoResponse.ok) {
          console.log('✅ Carrito temporal guardado exitosamente');
        } else {
          console.log('⚠️ Error guardando carrito temporal, continuando...');
        }
      } catch (carritoError) {
        console.log('⚠️ Error en carrito temporal:', carritoError);
        // Continuar con el pago aunque falle guardar carrito
      }
      
      console.log('🔗 Referencia generada:', reference);

      const amountInCents = total * 100;
      const signature = await calculateSignature(reference, amountInCents);

      // 📱 PREPARAR DATOS DEL CLIENTE
      const phoneNumber = deliveryData.telefono_contacto || '3001234567';
      const phoneNumberPrefix = phoneNumber.startsWith('+57') ? '+57' : '+57';
      const cleanPhoneNumber = phoneNumber.replace(/^\+57/, '');

      // 🎯 CONFIGURACIÓN SIMPLIFICADA PARA EVITAR ERRORES
      const widgetConfig = {
        currency: 'COP',
        amountInCents: amountInCents,
        reference: reference,
        publicKey: WOMPI_PUBLIC_KEY,
        signature: {
          integrity: signature
        },
        redirectUrl: window.location.origin,
        customerData: {
          email: deliveryData.email || 'cliente@supercasa.com',
          fullName: deliveryData.nombre || 'Cliente Supercasa',
          phoneNumber: cleanPhoneNumber,
          phoneNumberPrefix: phoneNumberPrefix
        }
        // Removidas opciones que pueden causar conflictos
      };

      console.log('🔧 Configuración del widget:', {
        ...widgetConfig,
        signature: { integrity: signature.substring(0, 10) + '...' },
        publicKey: WOMPI_PUBLIC_KEY.substring(0, 15) + '...'
      });

      // 🎯 INICIALIZAR CON MANEJO DE ERRORES ROBUSTO
      console.log('🎯 Inicializando WOMPI Widget...');
      
      let checkout;
      try {
        checkout = new window.WidgetCheckout(widgetConfig);
      } catch (initError) {
        console.error('❌ Error al crear WidgetCheckout:', initError);
        // Reintentar con configuración mínima
        console.log('🔄 Reintentando con configuración mínima...');
        checkout = new window.WidgetCheckout({
          currency: 'COP',
          amountInCents: amountInCents,
          reference: reference,
          publicKey: WOMPI_PUBLIC_KEY,
          signature: {
            integrity: signature
          }
        });
      }
      
      // 🚀 ABRIR WIDGET CON TIMEOUT EXTENDIDO Y MEJOR MANEJO
      console.log('🎯 Abriendo WOMPI Widget...');
      
      // 🆕 MARCAR TIEMPO DE APERTURA PARA DETECTAR DAVIPLATA
      window.widgetOpenTimestamp = Date.now();
      
      // ⚡ LOGGING ULTRA VISIBLE PARA DEBUG
      console.log('🚨🚨🚨 WIDGET ABIERTO - TIMESTAMP:', window.widgetOpenTimestamp);
      console.log('🚨🚨🚨 REFERENCIA PARA DAVIPLATA:', reference);
      
      const widgetPromise = new Promise((resolve, reject) => {
        try {
          checkout.open(function(result) {
            const closeTime = Date.now();
            const openDuration = closeTime - window.widgetOpenTimestamp;
            
            console.log('🚨🚨🚨 WIDGET CERRADO - TIMESTAMP:', closeTime);
            console.log('🚨🚨🚨 DURACIÓN ABIERTO:', openDuration, 'ms');
            console.log('🚨🚨🚨 RESULTADO COMPLETO:', JSON.stringify(result, null, 2));
            
            // Guardar resultado globalmente para debug
            window.lastWompiResult = result;
            window.lastWidgetDuration = openDuration;
            
            resolve(result);
          });
        } catch (openError) {
          console.error('❌ Error al abrir widget:', openError);
          reject(openError);
        }
      });

      // Timeout extendido de 5 minutos (300 segundos)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout abriendo widget - 5 minutos')), 300000);
      });

      const result = await Promise.race([widgetPromise, timeoutPromise]);
      
      setLoading(false);
      
      console.log('🔍 Procesando resultado del widget:', result);
      
      // 🆕 NUEVA LÓGICA: Usar función de manejo de cierre
      handleWidgetClose(result, reference);

    } catch (error) {
      console.error('❌ Error inicializando pago:', error);
      setLoading(false);
      // 🆕 LIMPIAR estados DaviPlata en caso de error
      setShowDaviPlataWait(false);
      setIsDaviPlataFlow(false);
      
      // Mensajes más específicos según el tipo de error
      if (error.message.includes('Clave')) {
        toast.error('Error de configuración: Claves WOMPI inválidas');
      } else if (error.message.includes('Timeout')) {
        toast.error('El widget tardó mucho en cargar. Intenta de nuevo.');
      } else {
        toast.error('Error al inicializar el pago: ' + error.message);
      }
      
      if (onPaymentError) onPaymentError(error);
    }
  };

  // 🧹 CLEANUP AL DESMONTAR + DEBUG GLOBAL
  useEffect(() => {
    // ⚡ FUNCIONES DE DEBUG GLOBALES PARA MÓVIL
    window.supercasaDebug = {
      estados: () => {
        console.log('🚨🚨🚨 ESTADOS ACTUALES:', {
          loading,
          pollingActive,
          showDaviPlataWait,
          isDaviPlataFlow,
          transactionReference,
          daviPlataCountdown
        });
        alert(`Estados: loading=${loading}, polling=${pollingActive}, daviplata=${showDaviPlataWait}, ref=${transactionReference}`);
      },
      forzarVerificacion: () => {
        console.log('🚨🚨🚨 FORZANDO VERIFICACIÓN MANUAL');
        if (transactionReference) {
          startPolling(transactionReference);
          alert('Verificación forzada iniciada');
        } else {
          alert('No hay referencia de transacción');
        }
      },
      limpiarTodo: () => {
        console.log('🚨🚨🚨 LIMPIANDO TODOS LOS ESTADOS');
        setShowDaviPlataWait(false);
        setIsDaviPlataFlow(false);
        setPollingActive(false);
        setLoading(false);
        alert('Estados limpiados');
      }
    };
    
    return () => {
      setPollingActive(false);
      setShowDaviPlataWait(false);
      setIsDaviPlataFlow(false);
      delete window.supercasaDebug;
    };
  }, [loading, pollingActive, showDaviPlataWait, isDaviPlataFlow, transactionReference]);

  return (
    <div className="wompi-checkout">
      {/* BOTÓN PRINCIPAL */}
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
        {loading && '🔄 Inicializando pago...'}
        {pollingActive && '🔍 Verificando pago automáticamente...'}
        {showDaviPlataWait && '📱 Esperando regreso de DaviPlata...'}
        {!loading && !pollingActive && !showDaviPlataWait && '💳 Proceder al Pago Seguro con WOMPI'}
      </button>

      {/* 🆕 NUEVO: ESTADO DE ESPERA DAVIPLATA - VERSIÓN AGRESIVA */}
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
          
          <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded">
            <p className="text-xs text-red-700">
              ⚠️ <strong>IMPORTANTE:</strong> Solo presiona "YA PAGUÉ" si DaviPlata confirmó tu pago exitosamente.
            </p>
          </div>
        </div>
      )}

      {/* ESTADO DE POLLING (sin cambios) */}
      {pollingActive && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-blue-700 font-medium">
              Verificando pago automáticamente... (Intento {pollingAttempts + 1}/120)
            </span>
          </div>
          <p className="text-blue-600 text-sm mt-2">
            Completa tu pago en Nequi/PSE/DaviPlata. El sistema detectará automáticamente cuando se apruebe.
          </p>
          
          {/* VERIFICACIÓN MANUAL DE EMERGENCIA */}
          {pollingAttempts > 10 && (
            <button
              onClick={() => showManualConfirmation(transactionReference)}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              ⚡ Confirmar pago manualmente
            </button>
          )}
          
          {/* ✅ NUEVO: Enlace a verificación adicional */}
          <div className="mt-3 text-center">
            <button
              onClick={() => window.open('/verificar-pago', '_blank')}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              🔍 ¿Ya pagaste? Verifica tu pago aquí
            </button>
          </div>
          
          {/* ✅ NUEVO: Información adicional para tranquilizar al usuario */}
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

      {/* BOTÓN CANCELAR */}
      {!loading && !pollingActive && !showDaviPlataWait && onCancel && (
        <button
          onClick={onCancel}
          className="mt-3 w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </button>
      )}

      {/* 🆕 DEBUG: Solo visible en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
          🔧 Debug móvil: Consola → <code>window.supercasaDebug.estados()</code>
        </div>
      )}
    </div>
  );
};

export default WompiCheckout;