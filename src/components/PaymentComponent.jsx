import React, { useState } from 'react';

const PaymentComponent = ({ 
  total, 
  carrito, 
  deliveryData, 
  onPaymentSuccess, 
  onPaymentError, 
  onCancel 
}) => {
  const [metodoPago, setMetodoPago] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [telefono, setTelefono] = useState('');
  const [cedula, setCedula] = useState('');
  const [banco, setBanco] = useState('');
  const [estadoPago, setEstadoPago] = useState('seleccion'); // 'seleccion', 'procesando', 'esperando', 'completado'
  const [transactionId, setTransactionId] = useState('');

  const bancosPSE = [
    { codigo: '1022', nombre: 'Banco de Bogotá' },
    { codigo: '1032', nombre: 'Banco Popular' },
    { codigo: '1052', nombre: 'Banco AV Villas' },
    { codigo: '1001', nombre: 'Banco de Colombia' },
    { codigo: '1006', nombre: 'Corpbanca' },
    { codigo: '1012', nombre: 'Banco GNB Sudameris' },
    { codigo: '1019', nombre: 'Scotiabank Colpatria' },
    { codigo: '1507', nombre: 'NEQUI' }
  ];

  const crearPago = async () => {
    if (!metodoPago) {
      alert('Selecciona un método de pago');
      return;
    }

    if (!telefono || telefono.length < 10) {
      alert('Ingresa un teléfono válido (10 dígitos)');
      return;
    }

    if (!cedula || cedula.length < 6) {
      alert('Ingresa una cédula válida');
      return;
    }

    if (metodoPago === 'PSE' && !banco) {
      alert('Selecciona un banco para PSE');
      return;
    }

    setProcesando(true);
    setEstadoPago('procesando');

    try {
      console.log('💳 Iniciando pago:', { metodoPago, total, telefono });

      const token = localStorage.getItem('token');
      
      //const response = await fetch('http://localhost:3000/api/crear-pago', {
      // PaymentComponent.jsx - línea ~49 aprox
      const response = await fetch('https://supercasa-backend-vvu1.onrender.com/api/crear-pago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          metodoPago,
          monto: total,
          productos: carrito,
          datosEntrega: deliveryData,
          telefono,
          cedula,
          banco
        })
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.error || 'Error creando pago');
      }

      console.log('✅ Pago creado:', resultado);

      setTransactionId(resultado.transactionId);
      setEstadoPago('esperando');

      // Para DaviPlata, redirigir a URL específica
      if (metodoPago === 'DAVIPLATA' && resultado.daviplataUrl) {
        console.log('🔗 Redirigiendo a DaviPlata:', resultado.daviplataUrl);
        setEstadoPago('redirigiendo');
        // Redirigir después de 2 segundos para que el usuario vea el mensaje
        setTimeout(() => {
          window.location.href = resultado.daviplataUrl;
        }, 2000);
      } else if (metodoPago === 'NEQUI') {
        iniciarVerificacionPago(resultado.transactionId);
      } else if (metodoPago === 'PSE') {
        iniciarVerificacionPago(resultado.transactionId);
      }

    } catch (error) {
      console.error('❌ Error creando pago:', error);
      alert(`Error: ${error.message}`);
      setProcesando(false);
      setEstadoPago('seleccion');
    }
  };

  const iniciarVerificacionPago = async (txId) => {
    console.log(`🔍 Iniciando verificación para: ${txId}`);
    
    const maxIntentos = 30; // 5 minutos máximo
    let intentos = 0;

    const verificar = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(
          `https://supercasa-backend-vvu1.onrender.com/api/consultar-pago/${txId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const resultado = await response.json();
        
        console.log(`📊 Verificación ${intentos + 1}:`, resultado);

        if (resultado.status === 'APPROVED' && resultado.found) {
          console.log('🎉 Pago aprobado!');
          setEstadoPago('completado');
          setProcesando(false);
          onPaymentSuccess(resultado);
          return;
        }

        if (resultado.status === 'DECLINED') {
          console.log('❌ Pago rechazado');
          setProcesando(false);
          setEstadoPago('seleccion');
          onPaymentError('Pago rechazado');
          return;
        }

        // Continuar verificando si está PENDING
        intentos++;
        if (intentos < maxIntentos) {
          setTimeout(verificar, 10000); // Verificar cada 10 segundos
        } else {
          console.log('⏰ Timeout verificando pago');
          setProcesando(false);
          setEstadoPago('seleccion');
          alert('El pago está tomando más tiempo del esperado. Verifica tu app bancaria.');
        }

      } catch (error) {
        console.error('❌ Error verificando pago:', error);
        intentos++;
        if (intentos < maxIntentos) {
          setTimeout(verificar, 10000);
        } else {
          setProcesando(false);
          setEstadoPago('seleccion');
        }
      }
    };

    verificar();
  };

  const cancelarPago = () => {
    setProcesando(false);
    setEstadoPago('seleccion');
    setTransactionId('');
    onCancel();
  };

// UI de espera para DaviPlata/Nequi
  if (estadoPago === 'esperando') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          
          {metodoPago === 'DAVIPLATA' && (
            <div>
              <h3 className="text-xl font-bold text-blue-600 mb-3">📱 DaviPlata</h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-blue-800 mb-2">🔔 INSTRUCCIONES:</p>
                <ol className="text-left text-sm text-blue-700 space-y-1">
                  <li>1. 📱 Abre tu app <strong>DaviPlata</strong></li>
                  <li>2. 🔔 Verifica notificaciones de pago</li>
                  <li>3. 💰 Confirma pago de <strong>${total.toLocaleString()}</strong></li>
                  <li>4. ✅ Ingresa tu clave DaviPlata</li>
                </ol>
              </div>
              <div className="bg-yellow-50 p-3 rounded mb-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>¿No llegó notificación?</strong><br/>
                  Verifica que el número <strong>{telefono}</strong> sea correcto<br/>
                  y que tengas DaviPlata instalado
                </p>
              </div>
            </div>
          )}

          {metodoPago === 'NEQUI' && (
            <div>
              <h3 className="text-xl font-bold text-purple-600 mb-3">💜 Nequi</h3>
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <p className="font-semibold text-purple-800 mb-2">🔔 INSTRUCCIONES:</p>
                <ol className="text-left text-sm text-purple-700 space-y-1">
                  <li>1. 📱 Abre tu app <strong>Nequi</strong></li>
                  <li>2. 🔔 Verifica notificaciones de pago</li>
                  <li>3. 💰 Confirma pago de <strong>${total.toLocaleString()}</strong></li>
                  <li>4. ✅ Autoriza con tu PIN</li>
                </ol>
              </div>
            </div>
          )}

          {metodoPago === 'PSE' && (
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-3">🏦 PSE</h3>
              <p className="text-gray-600 mb-4">Serás redirigido a tu banco para completar el pago</p>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded mb-4">
            <p className="text-sm text-gray-600">
              <strong>Monto:</strong> ${total.toLocaleString()} COP<br/>
              <strong>Teléfono:</strong> {telefono}<br/>
              <strong>ID:</strong> {transactionId}
            </p>
          </div>

          <div className="flex space-x-3">
            <button 
              onClick={cancelarPago}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              ❌ Cancelar
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
      </div>
    );
  }
  // UI de redirección para DaviPlata
  if (estadoPago === 'redirigiendo') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-pulse bg-blue-100 rounded-full h-20 w-20 mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">📱</span>
          </div>
          <h3 className="text-xl font-bold text-blue-600 mb-3">Redirigiendo a DaviPlata...</h3>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-blue-800 mb-2">✅ Transacción creada exitosamente</p>
            <p className="text-sm text-blue-600">
              Serás redirigido a DaviPlata para completar tu pago de <strong>${total.toLocaleString()}</strong>
            </p>
          </div>
          <div className="bg-yellow-50 p-3 rounded mb-4">
            <p className="text-xs text-yellow-800">
              💡 Después de completar el pago en DaviPlata, regresa a esta página para confirmar
            </p>
          </div>
          <p className="text-xs text-gray-500">ID: {transactionId}</p>
        </div>
      </div>
    );
  }

  // UI principal de selección
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-center">💳 Método de Pago</h3>
      
      <div className="mb-4">
        <p className="text-lg font-semibold text-green-600 mb-4">
          Total: ${total.toLocaleString()} COP
        </p>
      </div>

      {/* Selección de método */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Selecciona método de pago:</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="metodoPago"
              value="DAVIPLATA"
              checked={metodoPago === 'DAVIPLATA'}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="mr-2"
            />
            📱 DaviPlata
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="metodoPago"
              value="NEQUI"
              checked={metodoPago === 'NEQUI'}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="mr-2"
            />
            💜 Nequi
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="metodoPago"
              value="PSE"
              checked={metodoPago === 'PSE'}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="mr-2"
            />
            🏦 PSE
          </label>
        </div>
      </div>

      {/* Campos requeridos */}
      {metodoPago && (
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono:</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="3001234567"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              maxLength="10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Cédula:</label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="1024518451"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {metodoPago === 'PSE' && (
            <div>
              <label className="block text-sm font-medium mb-1">Banco:</label>
              <select
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona tu banco</option>
                {bancosPSE.map(bank => (
                  <option key={bank.codigo} value={bank.codigo}>
                    {bank.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Botones */}
      <div className="flex space-x-3">
        <button
          onClick={cancelarPago}
          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          onClick={crearPago}
          disabled={!metodoPago || procesando}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {procesando ? 'Procesando...' : 'Pagar'}
        </button>
      </div>
    </div>
  );
};

export default PaymentComponent;