import React, { useState, useEffect } from 'react';

const CardPayment = ({ 
  total, 
  carrito, 
  deliveryData, 
  onPaymentSuccess, 
  onPaymentError, 
  onCancel 
}) => {
  const [cardData, setCardData] = useState({
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: ''
  });
  
  const [cardType, setCardType] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState('');

  // Detectar tipo de tarjeta
  const detectCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]|^2[2-7]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6011|^644|^65/.test(cleanNumber)) return 'discover';
    
    return '';
  };

  // Formatear número de tarjeta
  const formatCardNumber = (value) => {
    const cleanValue = value.replace(/\s/g, '');
    const type = detectCardType(cleanValue);
    
    let formatted = '';
    if (type === 'amex') {
      formatted = cleanValue.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    } else {
      formatted = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    
    return formatted.substring(0, type === 'amex' ? 17 : 19);
  };

  // Validación Luhn
  const luhnCheck = (num) => {
    let arr = (num + '')
      .split('')
      .reverse()
      .map(x => parseInt(x));
    let lastDigit = arr.splice(0, 1)[0];
    let sum = arr.reduce((acc, val, i) => 
      (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9), 0);
    sum += lastDigit;
    return sum % 10 === 0;
  };

  // Validar campos
  const validateField = (field, value) => {
    switch (field) {
      case 'number':
        const cleanNumber = value.replace(/\s/g, '');
        if (!cleanNumber) return 'Número de tarjeta requerido';
        if (cleanNumber.length < 13) return 'Número muy corto';
        if (!luhnCheck(cleanNumber)) return 'Número de tarjeta inválido';
        return '';
      
      case 'expiryMonth':
        if (!value) return 'Mes requerido';
        const month = parseInt(value);
        if (month < 1 || month > 12) return 'Mes inválido';
        return '';
      
      case 'expiryYear':
        if (!value) return 'Año requerido';
        const currentYear = new Date().getFullYear() % 100;
        const year = parseInt(value);
        if (year < currentYear) return 'Tarjeta expirada';
        return '';
      
      case 'cvv':
        if (!value) return 'CVV requerido';
        const requiredLength = cardType === 'amex' ? 4 : 3;
        if (value.length !== requiredLength) return `CVV debe tener ${requiredLength} dígitos`;
        return '';
      
      case 'holderName':
        if (!value.trim()) return 'Nombre requerido';
        if (value.trim().length < 2) return 'Nombre muy corto';
        return '';
      
      default:
        return '';
    }
  };

  // Manejar cambios en inputs
  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    if (field === 'number') {
      processedValue = formatCardNumber(value);
      const newCardType = detectCardType(value);
      setCardType(newCardType);
    } else if (field === 'cvv') {
      const maxLength = cardType === 'amex' ? 4 : 3;
      processedValue = value.replace(/\D/g, '').substring(0, maxLength);
    } else if (field === 'expiryMonth' || field === 'expiryYear') {
      processedValue = value.replace(/\D/g, '').substring(0, 2);
    } else if (field === 'holderName') {
      processedValue = value.toUpperCase();
    }
    
    setCardData(prev => ({ ...prev, [field]: processedValue }));
    
    // Validar en tiempo real
    const error = validateField(field, processedValue);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Procesar pago con tarjeta
  const handlePayment = async () => {
    // Validar todos los campos
    const newErrors = {};
    Object.keys(cardData).forEach(field => {
      const error = validateField(field, cardData[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Por favor corrige los errores en el formulario');
      return;
    }

    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // 1. Tokenizar tarjeta
      const tokenResponse = await fetch('https://supercasa-backend-vvu1.onrender.com/api/tokenizar-tarjeta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          number: cardData.number.replace(/\s/g, ''),
          cvc: cardData.cvv,
          exp_month: cardData.expiryMonth,
          exp_year: `20${cardData.expiryYear}`,
          card_holder: cardData.holderName
        })
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(errorData.error || 'Error al tokenizar la tarjeta');
      }

      const tokenData = await tokenResponse.json();
      
      // 2. Crear transacción con token
      const paymentResponse = await fetch('https://supercasa-backend-vvu1.onrender.com/api/crear-pago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          metodoPago: 'CARD',
          monto: total,
          productos: carrito,
          datosEntrega: deliveryData,
          payment_source_id: tokenData.data.id,
          installments: 1
        })
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Error al procesar el pago');
      }

      const paymentData = await paymentResponse.json();
      
      if (paymentData.success) {
        onPaymentSuccess(paymentData);
      } else {
        throw new Error('Error procesando el pago');
      }
      
    } catch (error) {
      console.error('Error en pago con tarjeta:', error);
      onPaymentError(error.message || 'Error al procesar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  // Icono de tarjeta
  const getCardIcon = () => {
    const icons = {
      visa: '💳',
      mastercard: '💳', 
      amex: '💳',
      discover: '💳'
    };
    return icons[cardType] || '💳';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      {/* Header con botón de regreso */}
      <div className="flex items-center mb-6">
        <button
          onClick={onCancel}
          className="text-blue-600 hover:text-blue-800 mr-4 text-lg"
        >
          ←
        </button>
        <h3 className="text-xl font-semibold text-gray-800 flex-1 text-center">
          💳 Pagar con Tarjeta
        </h3>
      </div>
      
      {/* Línea 1: Número de tarjeta */}
      <div className="mb-4">
        <div className={`relative p-4 border-2 rounded-xl transition-all duration-200 ${
          focused === 'number' 
            ? 'border-blue-500 bg-blue-50' 
            : errors.number 
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 bg-gray-50'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getCardIcon()}</span>
            <input
              type="text"
              value={cardData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              onFocus={() => setFocused('number')}
              onBlur={() => setFocused('')}
              placeholder="•••• •••• •••• ••••"
              className="flex-1 bg-transparent text-lg font-mono focus:outline-none placeholder-gray-400"
              maxLength={19}
            />
            {cardType && (
              <span className="text-xs font-semibold text-gray-600 uppercase">
                {cardType}
              </span>
            )}
          </div>
        </div>
        {errors.number && (
          <p className="text-red-500 text-sm mt-1">{errors.number}</p>
        )}
      </div>

      {/* Línea 2: Fecha y CVV */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Fecha MM/YY */}
        <div>
          <div className={`relative p-4 border-2 rounded-xl transition-all duration-200 ${
            focused === 'expiry' 
              ? 'border-blue-500 bg-blue-50' 
              : (errors.expiryMonth || errors.expiryYear)
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={cardData.expiryMonth}
                onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                onFocus={() => setFocused('expiry')}
                onBlur={() => setFocused('')}
                placeholder="MM"
                className="w-8 bg-transparent text-center font-mono focus:outline-none placeholder-gray-400"
                maxLength={2}
              />
              <span className="text-gray-400 font-mono">/</span>
              <input
                type="text"
                value={cardData.expiryYear}
                onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                onFocus={() => setFocused('expiry')}
                onBlur={() => setFocused('')}
                placeholder="YY"
                className="w-8 bg-transparent text-center font-mono focus:outline-none placeholder-gray-400"
                maxLength={2}
              />
            </div>
          </div>
          {(errors.expiryMonth || errors.expiryYear) && (
            <p className="text-red-500 text-sm mt-1">
              {errors.expiryMonth || errors.expiryYear}
            </p>
          )}
        </div>

        {/* CVV */}
        <div>
          <div className={`relative p-4 border-2 rounded-xl transition-all duration-200 ${
            focused === 'cvv' 
              ? 'border-blue-500 bg-blue-50' 
              : errors.cvv
                ? 'border-red-500 bg-red-50'
                : 'border-gray-200 bg-gray-50'
          }`}>
            <input
              type="text"
              value={cardData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value)}
              onFocus={() => setFocused('cvv')}
              onBlur={() => setFocused('')}
              placeholder="CVV"
              className="w-full bg-transparent text-center font-mono focus:outline-none placeholder-gray-400"
              maxLength={cardType === 'amex' ? 4 : 3}
            />
          </div>
          {errors.cvv && (
            <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
          )}
        </div>
      </div>

      {/* Línea 3: Nombre del tarjetahabiente */}
      <div className="mb-6">
        <div className={`relative p-4 border-2 rounded-xl transition-all duration-200 ${
          focused === 'holderName' 
            ? 'border-blue-500 bg-blue-50' 
            : errors.holderName
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 bg-gray-50'
        }`}>
          <input
            type="text"
            value={cardData.holderName}
            onChange={(e) => handleInputChange('holderName', e.target.value)}
            onFocus={() => setFocused('holderName')}
            onBlur={() => setFocused('')}
            placeholder="NOMBRE EN LA TARJETA"
            className="w-full bg-transparent text-center font-semibold focus:outline-none placeholder-gray-400"
          />
        </div>
        {errors.holderName && (
          <p className="text-red-500 text-sm mt-1">{errors.holderName}</p>
        )}
      </div>

      {/* Resumen de pago */}
      <div className="bg-gray-50 p-4 rounded-xl mb-6">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total a pagar:</span>
          <span className="text-green-600">
            ${total?.toLocaleString('es-CO')} COP
          </span>
        </div>
      </div>

      {/* Botones */}
      <div className="flex space-x-3">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Cancelar
        </button>
        <button
          onClick={handlePayment}
          disabled={isProcessing || Object.keys(errors).some(key => errors[key])}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isProcessing ? 'Procesando...' : `Pagar $${total?.toLocaleString('es-CO')}`}
        </button>
      </div>
    </div>
  );
};

export default CardPayment;