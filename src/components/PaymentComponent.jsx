import React, { useState } from 'react';
import CardPayment from './CardPayment';

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
  const [showCardPayment, setShowCardPayment] = useState(false);

  const bancosPSE = [
  { codigo: '1040', nombre: 'Banco Agrario' },
  { codigo: '1052', nombre: 'Banco AV Villas' },
  { codigo: '1032', nombre: 'Banco Popular' },
  { codigo: '1022', nombre: 'Banco de Bogotá' },
  { codigo: '1001', nombre: 'Banco de Colombia (Bancolombia)' },
  { codigo: '1006', nombre: 'Banco Itaú' },
  { codigo: '1012', nombre: 'Banco GNB Sudameris' },
  { codigo: '1019', nombre: 'Scotiabank Colpatria' },
  { codigo: '1066', nombre: 'Banco Cooperativo Coopcentral' },
  { codigo: '1051', nombre: 'Banco Davivienda' },
  { codigo: '1001', nombre: 'Bancolombia' },
  { codigo: '1013', nombre: 'Banco BBVA' },
  { codigo: '1009', nombre: 'Citibank' },
  { codigo: '1370', nombre: 'Banco de las Microfinanzas - Bancamía' },
  { codigo: '1023', nombre: 'Banco de Occidente' },
  { codigo: '1062', nombre: 'Banco Falabella' },
  { codigo: '1303', nombre: 'Banco Pichincha' },
  { codigo: '1292', nombre: 'Banco Santander' }
];

  const crearPago = async () => {
    if (!metodoPago) {
      alert('Selecciona un método de pago');
      return;
    }

   if (metodoPago !== 'CARD' && (!telefono || telefono.length < 10)) {
      alert('Ingresa un teléfono válido (10 dígitos)');
      return;
    }

    if (metodoPago !== 'CARD' && (!cedula || cedula.length < 6)) {
      alert('Ingresa una cédula válida');
      return;
    }

    if (metodoPago === 'PSE' && !banco) {
      alert('Selecciona un banco para PSE');
      return;
    }

    if (metodoPago === 'CARD') {
      setShowCardPayment(true);
      return;
    }

    setProcesando(true);
    setEstadoPago('procesando');

    try {
      console.log('💳 Iniciando pago:', { metodoPago, total, telefono });

      const token = localStorage.getItem('token');
      
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
        setTimeout(() => {
          window.location.href = resultado.daviplataUrl;
        }, 2000);
      } else if (metodoPago === 'PSE' && resultado.pseUrl) {
        console.log('🔗 Redirigiendo a PSE:', resultado.pseUrl);
        setEstadoPago('redirigiendo');
        setTimeout(() => {
          window.location.href = resultado.pseUrl;
        }, 2000);
      } else if (metodoPago === 'NEQUI') {
        iniciarVerificacionPago(resultado.transactionId);
      } else if (metodoPago === 'PSE') {
        console.log('⚠️ PSE sin URL de redirección, usando verificación polling');
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
    
    const maxIntentos = 30;
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

        intentos++;
        if (intentos < maxIntentos) {
          setTimeout(verificar, 10000);
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

  // ✅ MOSTRAR INTERFAZ DE TARJETAS (SOLO cuando showCardPayment es true)
  if (showCardPayment) {
    console.log('🐛 DEBUG: Mostrando CardPayment porque showCardPayment =', showCardPayment);
    return (
      <CardPayment
        total={total}
        carrito={carrito}
        deliveryData={deliveryData}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        onCancel={() => {
          setShowCardPayment(false);
          setMetodoPago('');
        }}
      />
    );
  }

  // UI de espera para DaviPlata/Nequi (SOLO cuando se está procesando)
  if (estadoPago === 'esperando') {
    console.log('🐛 DEBUG: Mostrando UI de espera porque estadoPago =', estadoPago);
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

  // UI de redirección para DaviPlata/PSE
  if (estadoPago === 'redirigiendo') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <div className="text-center">
          <div className="animate-pulse bg-blue-100 rounded-full h-20 w-20 mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">
              {metodoPago === 'DAVIPLATA' && '📱'}
              {metodoPago === 'PSE' && '🏦'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-blue-600 mb-3">
            {metodoPago === 'DAVIPLATA' && 'Redirigiendo a DaviPlata...'}
            {metodoPago === 'PSE' && 'Redirigiendo a tu Banco...'}
          </h3>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-blue-800 mb-2">✅ Transacción creada exitosamente</p>
            <p className="text-sm text-blue-600">
              {metodoPago === 'DAVIPLATA' && `Serás redirigido a DaviPlata para completar tu pago de $${total.toLocaleString()}`}
              {metodoPago === 'PSE' && `Serás redirigido a tu banco para completar tu pago de $${total.toLocaleString()}`}
            </p>
          </div>
          <p className="text-xs text-gray-500">ID: {transactionId}</p>
        </div>
      </div>
    );
  }

  // ✅ COMPONENTE DE MÉTODO DE PAGO MEJORADO
  const PaymentMethodCard = ({ method, isSelected, onClick }) => {
    const renderLogo = (methodId) => {
      switch(methodId) {
        case 'CARD':
          return (
            <div className="relative">
              <div className="w-16 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg relative overflow-hidden shadow-lg">
                <div className="absolute top-2 left-2 w-3 h-2.5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm"></div>
                <div className="absolute bottom-1 left-1 text-white text-xs font-mono">1234</div>
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-800"></div>
              </div>
            </div>
          );
        case 'NEQUI':
          return (
            <div className="w-14 h-14 relative">
              <div className="absolute w-9 h-9 bg-gradient-to-br from-pink-500 to-pink-600 transform rotate-45 top-1 left-2.5 rounded-lg"></div>
              <div className="absolute w-7 h-7 bg-gradient-to-br from-cyan-400 to-cyan-500 transform rotate-45 top-2 left-3.5 rounded-md"></div>
              <div className="absolute w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 transform rotate-45 top-2.5 left-3 rounded-md"></div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-800">NEQUI</div>
            </div>
          );
        case 'DAVIPLATA':
          return (
            <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center relative shadow-lg">
              <div className="absolute top-3 w-10 h-5 bg-white rounded-t-full"></div>
              <div className="absolute top-6 w-6 h-2.5 bg-red-600 rounded-t-lg"></div>
              <div className="absolute bottom-2 text-white text-xs font-bold">DAVIPLATA</div>
            </div>
          );
        case 'PSE':
          return (
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex flex-col items-center justify-center shadow-lg">
              <div className="text-white text-xs font-light">ach</div>
              <div className="text-white text-sm font-bold tracking-wider">PSE</div>
              <div className="absolute inset-2 border-2 border-white border-opacity-20 rounded-full"></div>
            </div>
          );
        default:
          return null;
      }
    };

    const methodInfo = {
      'CARD': { 
        name: 'Tarjeta de Crédito/Débito', 
        description: 'Visa, MasterCard, American Express',
        badge: 'Nuevo',
        badgeColor: 'bg-green-500',
        benefit: 'Pago inmediato y seguro',
        gradient: 'from-blue-600 to-purple-600'
      },
      'NEQUI': { 
        name: 'Nequi', 
        description: 'Pago desde tu app Nequi',
        badge: 'Popular',
        badgeColor: 'bg-orange-500',
        benefit: 'Sin salir de la app',
        gradient: 'from-pink-500 to-purple-600'
      },
      'DAVIPLATA': { 
        name: 'DaviPlata', 
        description: 'Pago desde tu app DaviPlata',
        badge: 'Móvil',
        badgeColor: 'bg-red-500',
        benefit: 'Para usuarios Davivienda',
        gradient: 'from-red-600 to-red-700'
      },
      'PSE': { 
        name: 'PSE', 
        description: 'Débito desde cuenta bancaria',
        badge: 'Bancario',
        badgeColor: 'bg-blue-500',
        benefit: 'Directo desde tu banco',
        gradient: 'from-blue-600 to-blue-700'
      }
    };

    const info = methodInfo[method.id];
    if (!info) return null;

    return (
      <div 
        onClick={onClick}
        className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
          isSelected 
            ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg' 
            : 'border-gray-200 bg-white hover:border-amber-300'
        }`}
        style={{
          background: isSelected ? `linear-gradient(135deg, rgb(255 251 235), rgb(254 240 138))` : undefined
        }}
      >
        {/* Badge superior */}
        <div className={`absolute -top-2 -right-2 ${info.badgeColor} text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg`}>
          {info.badge}
        </div>

        {/* Barra superior con gradiente específico */}
        {isSelected && (
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${info.gradient} rounded-t-2xl`}></div>
        )}

        <div className="flex items-start space-x-4 mb-4">
          {/* Logo con animación */}
          <div className={`transition-transform duration-300 ${isSelected ? 'scale-110' : ''} ${
            method.id === 'CARD' && isSelected ? 'animate-pulse' : ''
          }`}>
            {renderLogo(method.id)}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{info.name}</h3>
            <p className="text-sm text-amber-600 font-medium">{info.description}</p>
          </div>
        </div>

        {/* Beneficio */}
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <span className="text-green-500">⚡</span>
          <span className="font-medium">{info.benefit}</span>
        </div>

        {/* Indicador de selección */}
        <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 transition-all duration-200 ${
          isSelected 
            ? 'border-amber-500 bg-amber-500' 
            : 'border-gray-300'
        }`}>
          {isSelected && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // UI principal de selección mejorada
  console.log('🐛 DEBUG: Mostrando selector de métodos porque showCardPayment =', showCardPayment, 'y estadoPago =', estadoPago);
  
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-800 mb-2">💳 Método de Pago</h3>
        <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-yellow-500 mx-auto rounded-full mb-4"></div>
        <p className="text-2xl font-bold text-amber-600 mb-2">
          Total: ${total.toLocaleString()} COP
        </p>
        <p className="text-gray-600">Selecciona tu método de pago preferido</p>
      </div>

      {/* Grid de métodos de pago mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { id: 'CARD', isNew: true },
          { id: 'NEQUI' },
          { id: 'DAVIPLATA' },
          { id: 'PSE' }
        ].map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            isSelected={metodoPago === method.id}
            onClick={() => setMetodoPago(method.id)}
          />
        ))}
      </div>

      {/* Campos requeridos con diseño mejorado */}
      {metodoPago && metodoPago !== 'CARD' && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
            Información Requerida
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="3001234567"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                maxLength="10"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cédula</label>
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="1024518451"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            {metodoPago === 'PSE' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Banco</label>
                <select
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
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
        </div>
      )}

      {/* Botones mejorados */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={cancelarPago}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
        >
          ❌ Cancelar
        </button>
        <button
          onClick={crearPago}
          disabled={!metodoPago || procesando}
          className="flex-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white py-4 px-8 rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
        >
          {procesando ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : (
            `🚀 Pagar ${metodoPago === 'CARD' ? 'con Tarjeta' : metodoPago}`
          )}
        </button>
      </div>

      {/* Footer informativo */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-center space-x-2 text-sm text-blue-700">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
          </svg>
          <span className="font-medium">Pago 100% seguro con tecnología WOMPI</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentComponent;