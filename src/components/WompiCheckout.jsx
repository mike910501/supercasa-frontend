// src/components/WompiCheckout.jsx
// VERSIÓN COMPLETA CON POLLING AUTOMÁTICO + CONFIRMACIÓN MANUAL COMO BACKUP

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
  const [isLoading, setIsLoading] = useState(false);
  const [reference, setReference] = useState('');
  const [showManualConfirm, setShowManualConfirm] = useState(false);
  const [manualTimer, setManualTimer] = useState(0);
  const [pollingActive, setPollingActive] = useState(false);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState('');

  // ✅ CONFIGURACIÓN WOMPI PRODUCCIÓN
  const WOMPI_PUBLIC_KEY = process.env.REACT_APP_WOMPI_PUBLIC_KEY || 'pub_prod_GkQ7DyAjNXb63f1Imr9OQ1YNHLXd89FT';
  const WOMPI_INTEGRITY_KEY = process.env.REACT_APP_WOMPI_INTEGRITY_KEY || 'prod_integrity_70Ss0SPlsMMTT4uSx4zz85lOCTVtLKDa';
  const WOMPI_PRIVATE_KEY = process.env.REACT_APP_WOMPI_PRIVATE_KEY || 'prv_prod_bR8TUl71quylBwNiQcNn8OIFD1i9IdsR';
  const WOMPI_WIDGET_URL = 'https://checkout.wompi.co/widget.js';

  // ✅ CALCULAR SIGNATURE CON WEB CRYPTO API
  const calculateSignature = async (reference, amountInCents, currency = 'COP') => {
    const dataToSign = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_KEY}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // ✅ GENERAR REFERENCIA INICIAL
  useEffect(() => {
    const generateInitialReference = () => {
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const userId = deliveryData?.usuario_id || '000';
      const randomSuffix = Math.floor(Math.random() * 9999);
      return `SC-${userId}-${timestamp}-${random}-${randomSuffix}`;
    };
    
    const newRef = generateInitialReference();
    setReference(newRef);
    console.log('🔗 Referencia generada:', newRef);
  }, []);

  // 🔄 POLLING AUTOMÁTICO - LA CLAVE DEL ÉXITO (USANDO FETCH)
  const checkTransactionStatus = async (reference) => {
    try {
      console.log(`🔍 Verificando transacción: ${reference} (Intento ${pollingAttempts + 1})`);
      
      const response = await fetch(
        `https://api.wompi.co/v1/transactions?reference=${reference}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${WOMPI_PRIVATE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.data && data.data.length > 0) {
        const transaction = data.data[0];
        console.log('📊 Transacción encontrada:', transaction);
        return {
          found: true,
          status: transaction.status,
          id: transaction.id,
          transaction: transaction
        };
      }
      
      console.log('⏳ Transacción aún no encontrada en WOMPI');
      return { found: false, status: 'NOT_FOUND' };
    } catch (error) {
      console.error('❌ Error verificando transacción:', error);
      return { found: false, status: 'ERROR', error: error.message };
    }
  };

  const startPolling = (reference) => {
    setPollingActive(true);
    setPollingAttempts(0);
    setPaymentStatus('polling');
    
    console.log('🔄 INICIANDO POLLING AUTOMÁTICO para:', reference);
    
    const pollInterval = setInterval(async () => {
      const currentAttempt = pollingAttempts + 1;
      setPollingAttempts(currentAttempt);
      
      const result = await checkTransactionStatus(reference);
      
      if (result.found && result.status === 'APPROVED') {
        console.log('✅ ¡PAGO APROBADO DETECTADO AUTOMÁTICAMENTE!');
        clearInterval(pollInterval);
        setPollingActive(false);
        setIsLoading(false);
        setPaymentStatus('approved');
        
        toast.success('¡Pago aprobado automáticamente! Creando pedido...', {
          duration: 4000,
          icon: '✅'
        });

        const successData = {
          id: result.id,
          status: 'APPROVED',
          state: 'APPROVED',
          reference: reference,
          total: total,
          verified: true,
          method: 'automatic_polling',
          transaction_id: result.id,
          payment_method: result.transaction.payment_method?.type || 'WOMPI'
        };

        onPaymentSuccess(successData);
        
      } else if (result.found && result.status === 'DECLINED') {
        console.log('❌ Pago RECHAZADO detectado automáticamente');
        clearInterval(pollInterval);
        setPollingActive(false);
        setIsLoading(false);
        setPaymentStatus('declined');
        
        toast.error('Pago rechazado por la entidad financiera', {
          duration: 4000
        });
        
        onPaymentError({
          status: 'DECLINED',
          reference: reference,
          method: 'automatic_polling'
        });
        
      } else if (currentAttempt >= 36) { // 3 minutos máximo (5 seg * 36)
        console.log('⏰ Timeout de polling - Activando confirmación manual');
        clearInterval(pollInterval);
        setPollingActive(false);
        setPaymentStatus('timeout');
        
        // Activar confirmación manual después del timeout
        setShowManualConfirm(true);
        setManualTimer(60);
        
        toast('⏰ Verificación automática terminó. ¿Su pago fue exitoso?', {
          duration: 5000,
          icon: '❓'
        });
      } else {
        console.log(`⏳ Polling ${currentAttempt}/36 - Estado: ${result.status}`);
      }
    }, 5000); // Cada 5 segundos

    // Cleanup en caso de que el componente se desmonte
    return () => {
      clearInterval(pollInterval);
      setPollingActive(false);
    };
  };

  // ✅ TIMER PARA CONFIRMACIÓN MANUAL
  useEffect(() => {
    let interval;
    if (showManualConfirm && manualTimer > 0) {
      interval = setInterval(() => {
        setManualTimer(prev => prev - 1);
      }, 1000);
    } else if (showManualConfirm && manualTimer === 0) {
      setShowManualConfirm(false);
      setIsLoading(false);
      setPaymentStatus('');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showManualConfirm, manualTimer]);

  // ✅ CONFIRMAR PAGO MANUAL
  const confirmManualPayment = (wasSuccessful) => {
    setShowManualConfirm(false);
    setIsLoading(false);
    setPaymentStatus('');

    if (wasSuccessful) {
      const successData = {
        id: 'manual-' + Date.now(),
        status: 'APPROVED',
        state: 'APPROVED',
        reference: reference,
        total: total,
        verified: true,
        method: 'manual_confirmation',
        manual_creation: true
      };

      toast.success('¡Pago confirmado manualmente! Creando pedido...', {
        duration: 4000,
        icon: '✅'
      });

      onPaymentSuccess(successData);
    } else {
      toast.error('Pago cancelado. Puede intentar nuevamente.', {
        duration: 3000
      });
      setPaymentStatus('');
    }
  };

  // ✅ INICIALIZAR PAGO CON POLLING
  const initializePayment = async () => {
    console.log('🚀 INICIANDO PAGO CON POLLING AUTOMÁTICO');
    
    const amountInCents = Math.round(total * 100);
    setIsLoading(true);
    setPaymentStatus('initializing');

    try {
      // Preparar teléfono
      const telefono = deliveryData.telefono_contacto || '3001234567';
      const telefonoLimpio = telefono.replace(/\D/g, '');
      
      let phoneNumber, phoneNumberPrefix;
      if (telefonoLimpio.startsWith('57') && telefonoLimpio.length === 12) {
        phoneNumberPrefix = '+57';
        phoneNumber = telefonoLimpio.substring(2);
      } else if (telefonoLimpio.length === 10) {
        phoneNumberPrefix = '+57';
        phoneNumber = telefonoLimpio;
      } else {
        phoneNumberPrefix = '+57';
        phoneNumber = '3001234567';
      }
      
      // Calcular signature
      const signature = await calculateSignature(reference, amountInCents, 'COP');
      console.log('🔐 Signature calculada:', signature.substring(0, 10) + '...');
      
      // Limpiar scripts previos
      const existingContainers = document.querySelectorAll('[data-wompi-container="true"]');
      existingContainers.forEach(container => container.remove());
      
      // Crear script WOMPI
      const script = document.createElement('script');
      script.src = WOMPI_WIDGET_URL;
      script.setAttribute('data-wompi', 'true');
      
      // Configurar atributos
      script.setAttribute('data-render', 'button');
      script.setAttribute('data-public-key', WOMPI_PUBLIC_KEY);
      script.setAttribute('data-currency', 'COP');
      script.setAttribute('data-amount-in-cents', amountInCents.toString());
      script.setAttribute('data-reference', reference);
      script.setAttribute('data-signature:integrity', signature);
      
      // Datos del cliente
      script.setAttribute('data-customer-data:email', deliveryData.email || 'cliente@supercasa.com');
      script.setAttribute('data-customer-data:full-name', deliveryData.nombre || 'Cliente Supercasa');
      script.setAttribute('data-customer-data:phone-number', phoneNumber);
      script.setAttribute('data-customer-data:phone-number-prefix', phoneNumberPrefix);
      
      // ✅ CALLBACKS MEJORADOS
      window.wompiCheckoutOpen = () => {
        console.log('🎯 WOMPI Widget abierto');
        setPaymentStatus('widget_open');
        toast('Procesando pago...', { icon: '💳' });
      };

      window.wompiCheckoutClose = () => {
        console.log('📱 WOMPI Widget cerrado');
        setPaymentStatus('widget_closed');
        
        // 🔄 INICIAR POLLING AUTOMÁTICO después de 3 segundos
        setTimeout(() => {
          if (!pollingActive) {
            console.log('🔄 Iniciando polling automático...');
            startPolling(reference);
          }
        }, 3000);
      };

      // ✅ CALLBACKS DIRECTOS (backup por si funcionan)
      window.wompiCheckoutApproved = (transaction) => {
        console.log('✅ Callback directo APROBADO:', transaction);
        setIsLoading(false);
        setPollingActive(false);
        setPaymentStatus('approved');
        
        toast.success('¡Pago aprobado via callback directo!', {
          duration: 4000,
          icon: '⚡'
        });
        
        onPaymentSuccess({
          ...transaction,
          reference: reference,
          total: total,
          status: 'APPROVED',
          verified: true,
          method: 'direct_callback'
        });
      };

      window.wompiCheckoutDeclined = (transaction) => {
        console.log('❌ Callback directo RECHAZADO:', transaction);
        setIsLoading(false);
        setPollingActive(false);
        setPaymentStatus('declined');
        
        onPaymentError({
          ...transaction,
          status: 'DECLINED',
          method: 'direct_callback'
        });
      };
      
      script.onload = () => {
        console.log('✅ Script WOMPI cargado exitosamente');
        setPaymentStatus('script_loaded');
        
        setTimeout(() => {
          const wompiButton = document.querySelector('button[data-wompi-payment-button]') || 
                             document.querySelector('.wompi-widget-button') ||
                             script.nextElementSibling;
          
          if (wompiButton && typeof wompiButton.click === 'function') {
            console.log('🎯 ACTIVANDO WIDGET WOMPI VIA BOTÓN');
            wompiButton.click();
          } else {
            console.log('⚠️ Botón WOMPI no encontrado, intentando método alternativo');
            // Método alternativo si no encuentra el botón
            if (window.WidgetCheckout) {
              const checkout = new window.WidgetCheckout({
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
                  phoneNumber: phoneNumber,
                  phoneNumberPrefix: phoneNumberPrefix
                }
              });
              
              checkout.open((result) => {
                console.log('📱 Widget programático cerrado:', result);
                setTimeout(() => startPolling(reference), 3000);
              });
            }
          }
        }, 1500);
      };
      
      script.onerror = (error) => {
        console.error('❌ Error cargando script WOMPI:', error);
        toast.error('Error cargando sistema de pagos');
        setIsLoading(false);
        setPaymentStatus('script_error');
      };
      
      // Agregar al DOM
      const container = document.createElement('div');
      container.setAttribute('data-wompi-container', 'true');
      container.style.display = 'none';
      container.appendChild(script);
      document.body.appendChild(container);

    } catch (error) {
      console.error('❌ Error general inicializando pago:', error);
      toast.error('Error al inicializar el pago');
      setIsLoading(false);
      setPaymentStatus('init_error');
    }
  };

  // Cleanup al desmontar componente
  useEffect(() => {
    return () => {
      setPollingActive(false);
      const containers = document.querySelectorAll('[data-wompi-container="true"]');
      containers.forEach(container => container.remove());
    };
  }, []);

  // 🎨 RENDER DEL ESTADO ACTUAL
  const renderCurrentStatus = () => {
    if (pollingActive) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <h4 className="font-bold text-blue-800 mb-2">🔄 Verificando pago automáticamente</h4>
            <p className="text-sm text-blue-700 mb-2">
              Verificación {pollingAttempts}/36 cada 5 segundos
            </p>
            <p className="text-xs text-blue-600">
              Referencia: <strong>{reference}</strong>
            </p>
          </div>
        </div>
      );
    }

    if (paymentStatus === 'approved') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="text-center text-green-800">
            <h4 className="font-bold mb-2">✅ ¡Pago aprobado!</h4>
            <p className="text-sm">Creando su pedido...</p>
          </div>
        </div>
      );
    }

    if (paymentStatus === 'declined') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="text-center text-red-800">
            <h4 className="font-bold mb-2">❌ Pago rechazado</h4>
            <p className="text-sm">El pago fue rechazado por la entidad financiera</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full">
      {/* Estado actual del pago */}
      {renderCurrentStatus()}

      {/* Confirmación manual */}
      {showManualConfirm && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
          <div className="text-center">
            <h4 className="font-bold text-orange-800 mb-3">❓ ¿Su pago fue exitoso?</h4>
            <p className="text-sm text-orange-700 mb-4">
              La verificación automática no pudo confirmar el pago. 
              ¿Su transacción fue exitosa?
              <br />Auto-cancela en: <strong>{manualTimer}s</strong>
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => confirmManualPayment(true)}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700"
              >
                ✅ Sí, pago exitoso
              </button>
              <button
                onClick={() => confirmManualPayment(false)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700"
              >
                ❌ No, falló el pago
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resumen del pedido */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-200">
        <h3 className="font-bold text-lg text-gray-800 mb-3">💳 Pago Automático WOMPI</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>📦 Productos:</span>
            <span>{carrito.length} items</span>
          </div>
          <div className="flex justify-between">
            <span>📍 Entrega:</span>
            <span>Torre {deliveryData.torre_entrega}, Piso {deliveryData.piso_entrega}, Apt {deliveryData.apartamento_entrega}</span>
          </div>
          <div className="flex justify-between">
            <span>⚡ Tiempo estimado:</span>
            <span>Máximo 20 minutos</span>
          </div>
          <div className="border-t border-blue-300 pt-2 mt-3">
            <div className="flex justify-between font-bold text-lg">
              <span>💰 Total a pagar:</span>
              <span className="text-blue-600">${total.toLocaleString()} COP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información de referencia */}
      {reference && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
          <p className="text-gray-600">
            <strong>Referencia:</strong> {reference}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            🔄 Con verificación automática cada 5 segundos + confirmación manual de backup
          </p>
        </div>
      )}

      {/* Botón de pago principal */}
      <button
        onClick={initializePayment}
        disabled={isLoading || showManualConfirm || pollingActive || !reference}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          isLoading || showManualConfirm || pollingActive || !reference
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
        } text-white`}
      >
        {pollingActive ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
            Verificando pago automáticamente...
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
            Inicializando pago...
          </div>
        ) : showManualConfirm ? (
          'Confirme el resultado de su pago arriba ⬆️'
        ) : (
          `🔄 Pagar $${total.toLocaleString()} - Verificación Automática`
        )}
      </button>

      {/* Botón cancelar */}
      <button
        onClick={onCancel}
        disabled={isLoading || pollingActive}
        className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
      >
        ← Volver al carrito
      </button>

      {/* Información de seguridad */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-600 mt-1 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
          </svg>
          <div className="text-sm text-green-800">
            <p className="font-medium">🔄 Verificación automática cada 5 segundos</p>
            <p>Si el polling falla, confirmación manual disponible como backup</p>
            <p className="text-xs mt-1 opacity-75">Ref: {reference}</p>
          </div>
        </div>
      </div>

      {/* Debug info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <p><strong>Debug:</strong> Status: {paymentStatus}</p>
          <p>Polling: {pollingActive ? 'Activo' : 'Inactivo'}</p>
          <p>Intentos: {pollingAttempts}</p>
        </div>
      )}
    </div>
  );
};

export default WompiCheckout;