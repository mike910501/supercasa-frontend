// src/pages/PaymentSuccess.jsx
// Página de confirmación de pago exitoso

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Obtener parámetros de WOMPI
  const transactionId = searchParams.get('id');
  const environment = searchParams.get('env');
  
  useEffect(() => {
    // Mostrar confirmación inmediata
    toast.success('¡Pago completado exitosamente!', {
      duration: 6000,
      icon: '🎉'
    });

    // Auto-redirección después de 5 segundos
    const timer = setTimeout(() => {
      setIsRedirecting(true);
      navigate('/store', { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleContinueShopping = () => {
    setIsRedirecting(true);
    navigate('/store', { replace: true });
  };

  const handleViewOrders = () => {
    setIsRedirecting(true);
    navigate('/orders', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Icono de éxito */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Pago Exitoso!</h1>
          <p className="text-gray-600">Su pedido ha sido procesado correctamente</p>
        </div>

        {/* Información de la transacción */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">📋 Detalles de la Transacción</h2>
          
          <div className="space-y-3 text-sm">
            {transactionId && (
              <div className="flex justify-between">
                <span className="text-gray-600">ID Transacción:</span>
                <span className="font-mono text-blue-600">{transactionId}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Estado:</span>
              <span className="text-green-600 font-semibold">✅ Pagado</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Procesado por:</span>
              <span className="font-semibold">WOMPI</span>
            </div>
            
            {environment && (
              <div className="flex justify-between">
                <span className="text-gray-600">Ambiente:</span>
                <span className={`font-semibold ${environment === 'prod' ? 'text-green-600' : 'text-orange-600'}`}>
                  {environment === 'prod' ? '🔴 Producción' : '🟡 Pruebas'}
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-600">Fecha:</span>
              <span>{new Date().toLocaleDateString('es-CO', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>
        </div>

        {/* Información de entrega */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">🚚 ¿Qué sigue?</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Su pedido está siendo preparado</p>
            <p>• Tiempo de entrega: <strong>Máximo 20 minutos</strong></p>
            <p>• Recibirá notificaciones del estado</p>
            <p>• El domiciliario se contactará antes de la entrega</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={handleContinueShopping}
            disabled={isRedirecting}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl font-semibold transition-all hover:from-green-600 hover:to-blue-700 disabled:opacity-50"
          >
            {isRedirecting ? 'Redirigiendo...' : '🛍️ Continuar Comprando'}
          </button>
          
          <button
            onClick={handleViewOrders}
            disabled={isRedirecting}
            className="w-full bg-white text-gray-700 py-3 rounded-xl font-semibold border border-gray-300 transition-all hover:bg-gray-50 disabled:opacity-50"
          >
            📦 Ver Mis Pedidos
          </button>
        </div>

        {/* Contador de redirección */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {isRedirecting ? 
              'Redirigiendo...' : 
              'Serás redirigido automáticamente en 5 segundos'
            }
          </p>
        </div>

        {/* Información de soporte */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            ¿Problemas? Contacta a soporte de Supercasa
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;