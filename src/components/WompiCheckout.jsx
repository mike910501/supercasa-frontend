// src/components/WompiCheckout.jsx
// VERSIÓN DEFINITIVA CON INICIALIZACIÓN ROBUSTA

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

// 🔄 POLLING MEJORADO - USA NUESTRO BACKEND
const checkTransactionStatus = async (reference) => {
  try {
    console.log(`🔍 Verificando transacción: ${reference} (Intento ${pollingAttempts + 1})`);
    
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
      console.log('📊 Respuesta verificación:', data);
      
      if (data.status === 'APPROVED') {
        console.log('✅ ¡PAGO APROBADO DETECTADO!');
        setPollingActive(false);
        
        // Crear pedido automáticamente
        await createOrder({
          reference: data.reference || reference,
          status: 'APPROVED',
          payment_method: { type: 'WOMPI' },
          id: reference,
          amount_in_cents: total * 100
        });
        return true;
        
      } else if (data.status === 'DECLINED') {
        console.log('❌ Pago rechazado');
        setPollingActive(false);
        toast.error('Pago rechazado');
        if (onPaymentError) onPaymentError({ status: 'DECLINED' });
        return true;
        
      } else {
        console.log(`⏳ Estado: ${data.status} - Continuando...`);
        return false;
      }
    } else {
      console.log('⚠️ Error en verificación:', response.status);
      return false;
    }
  } catch (error) {
    console.log('⚠️ Error en polling:', error);
    return false;
  }
};

  // 🎯 INICIAR POLLING MÁS AGRESIVO
  const startPolling = (reference) => {
    console.log('🔄 Iniciando polling AGRESIVO automático para:', reference);
    setPollingActive(true);
    setPollingAttempts(0);
    setTransactionReference(reference);

    // Primer intento inmediato
    setTimeout(() => checkTransactionStatus(reference), 1000);

    const pollInterval = setInterval(async () => {
      if (!pollingActive) {
        clearInterval(pollInterval);
        return;
      }

      const completed = await checkTransactionStatus(reference);
      setPollingAttempts(prev => prev + 1);

      if (completed || pollingAttempts >= 60) { // 60 intentos = 5 minutos
        clearInterval(pollInterval);
        setPollingActive(false);
        
        if (pollingAttempts >= 60) {
          console.log('⏰ Timeout de polling extendido - Activando confirmación manual');
          toast('⏰ Verificación automática agotada. ¿Tu pago fue exitoso?', {
            duration: 15000,
            icon: '⚡'
          });
          showManualConfirmation(reference);
        }
      }
    }, 3000); // Cada 3 segundos en lugar de 5

    // Cleanup al desmontar componente
    return () => {
      clearInterval(pollInterval);
      setPollingActive(false);
    };
  };

const createOrder = async (paymentData) => {
  try {
    console.log('💳 PAGO EXITOSO CONFIRMADO:', paymentData);
    console.log('✅ Creando pedido automáticamente...');

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Error: Token de autenticación no encontrado');
      setLoading(false);
      setPollingActive(false);
      return;
    }

    const pedidoData = {
        productos: carrito,
        total: total,
        ...deliveryData,
        // 💳 DATOS DE TRACKING WOMPI - CORREGIDO
        payment_reference: paymentData.reference || paymentData.id,
        payment_status: paymentData.status || 'APPROVED',
        payment_method: paymentData.payment_method?.type || 'WOMPI',
        payment_transaction_id: paymentData.id,
        payment_amount_cents: paymentData.amount_in_cents || (total * 100)
        };

    console.log('📦 Creando pedido:', pedidoData);

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
      
      toast.success('¡Pago aprobado automáticamente! Pedido creado con éxito', {
        duration: 5000
      });
      
      // ✅ RESETEAR ESTADOS ANTES DE CALLBACK
      setLoading(false);
      setPollingActive(false);
      
      if (onPaymentSuccess) {
        onPaymentSuccess({
          ...result,
          paymentData: paymentData
        });
      }
    } else {
      console.error('❌ Error al crear pedido:', response.status);
      const errorData = await response.json();
      console.error('Error details:', errorData);

      // ✅ MANEJO DE ERRORES DE STOCK
      if (errorData.error && errorData.error.includes('Stock insuficiente')) {
        toast.error(`❌ ${errorData.error}`, {
          duration: 6000,
          style: {
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca'
          }
        });
      } else if (errorData.detalles && Array.isArray(errorData.detalles)) {
        toast.error(`📦 Problemas de inventario:\n${errorData.detalles.join('\n')}`, {
          duration: 8000
        });
      } else {
        toast.error('Error al crear el pedido. Contacta soporte.');
      }
      
      // ✅ RESETEAR ESTADOS EN ERROR
      setLoading(false);
      setPollingActive(false);
    }
  } catch (error) {
    console.error('❌ Error en createOrder:', error);
    
    // ✅ MANEJO DE ERRORES ESPECÍFICOS
    if (error.message && error.message.includes('Stock')) {
      toast.error(`📦 ${error.message}`, {
        duration: 6000
      });
    } else {
      toast.error('Error al procesar el pedido');
    }
    
    // ✅ RESETEAR ESTADOS EN CATCH
    setLoading(false);
    setPollingActive(false);
  }
};

  // 📱 CONFIRMACIÓN MANUAL (BACKUP)
  const showManualConfirmation = (reference) => {
    const confirmed = window.confirm(
      '¿Tu pago fue procesado exitosamente?\n\n' +
      'Si pagaste con Nequi/PSE y recibiste confirmación, haz clic en "Aceptar".\n' +
      'Si hubo algún problema, haz clic en "Cancelar".'
    );

    if (confirmed) {
      console.log('✅ Confirmación manual: Pago exitoso');
      // Simular datos de pago para crear el pedido
      createOrder({
        reference: reference,
        status: 'APPROVED',
        payment_method: { type: 'MANUAL_CONFIRMATION' },
        id: reference,
        amount_in_cents: total * 100
      });
    } else {
      console.log('❌ Confirmación manual: Pago cancelado');
      toast.error('Pago cancelado por el usuario');
      if (onPaymentError) onPaymentError({ status: 'DECLINED' });
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
      
      const widgetPromise = new Promise((resolve, reject) => {
        try {
          checkout.open(function(result) {
            console.log('📱 Widget cerrado con resultado COMPLETO:', JSON.stringify(result, null, 2));
            
            // Guardar resultado globalmente para debug
            window.lastWompiResult = result;
            
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
      
      if (result && result.transaction) {
        console.log('✅ Transacción detectada en callback:', result.transaction);
        
        // 🎯 USAR ID REAL DE WOMPI, NO NUESTRA REFERENCIA
        const transactionId = result.transaction.id; // ID real de WOMPI
        const transactionRef = result.transaction.reference; // Nuestra referencia
        
        console.log('🆔 ID real de WOMPI:', transactionId);
        console.log('🔗 Nuestra referencia:', transactionRef);
        
        // Si ya está aprobado, crear pedido inmediatamente
        if (result.transaction.status === 'APPROVED') {
          console.log('🎉 ¡PAGO YA APROBADO! Creando pedido inmediatamente...');
          await createOrder(result.transaction);
        } else {
          console.log('⏳ Estado:', result.transaction.status, '- Iniciando polling con ID real');
          startPolling(transactionId); // Usar ID real, no referencia
        }
      } else if (result && result.error) {
        console.error('❌ Error en widget:', result.error);
        toast.error('Error en el procesamiento del pago');
        if (onPaymentError) onPaymentError(result.error);
      } else {
        // Widget cerrado sin información clara - iniciar polling preventivo
        console.log('⚠️ Widget cerrado, iniciando polling preventivo con referencia original');
        startPolling(reference);
      }

    } catch (error) {
      console.error('❌ Error inicializando pago:', error);
      setLoading(false);
      
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

  // 🧹 CLEANUP AL DESMONTAR
  useEffect(() => {
    return () => {
      setPollingActive(false);
    };
  }, []);

  return (
    <div className="wompi-checkout">
      {/* BOTÓN PRINCIPAL */}
      <button
        onClick={initializePayment}
        disabled={loading || pollingActive}
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300
          ${loading || pollingActive 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
          }
        `}
      >
        {loading && '🔄 Inicializando pago...'}
        {pollingActive && '🔍 Verificando pago automáticamente...'}
        {!loading && !pollingActive && '💳 Proceder al Pago Seguro con WOMPI'}
      </button>

      {/* ESTADO DE POLLING */}
      {pollingActive && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-blue-700 font-medium">
              Verificando pago automáticamente... (Intento {pollingAttempts + 1}/36)
            </span>
          </div>
          <p className="text-blue-600 text-sm mt-2">
            Completa tu pago en Nequi/PSE. El sistema detectará automáticamente cuando se apruebe.
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
        </div>
      )}

      {/* BOTÓN CANCELAR */}
      {!loading && !pollingActive && onCancel && (
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