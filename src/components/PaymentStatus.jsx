// src/components/PaymentStatus.jsx - CREAR ARCHIVO NUEVO
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const PaymentStatus = () => {
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const verificarPago = async () => {
    if (!transactionId.trim()) {
      toast.error('Ingresa el ID de transacción');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/verificar-pago/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.status === 'APPROVED') {
        toast.success('¡Tu pago fue exitoso! Tu pedido está siendo procesado.');
      } else if (data.status === 'PENDING') {
        toast.loading('Tu pago está siendo verificado. Intenta en unos minutos.');
      } else {
        toast.error('No se encontró información del pago.');
      }
    } catch (error) {
      toast.error('Error verificando el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 mt-8">
      <h2 className="text-xl font-bold text-center mb-4">
        🔍 Verificar Estado de Pago
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID de Transacción WOMPI:
          </label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="1290515-1751249435-98380"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lo encuentras en el email de confirmación de WOMPI
          </p>
        </div>
        
        <button
          onClick={verificarPago}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Verificando...' : 'Verificar Pago'}
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">¿No tienes el ID?</h3>
        <p className="text-sm text-gray-600">
          • Revisa tu email para el mensaje de WOMPI<br/>
          • Contacta soporte con tu número de celular<br/>
          • Espera máximo 10 minutos para procesamiento automático
        </p>
      </div>
    </div>
  );
};

export default PaymentStatus;