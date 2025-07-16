import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';
import { toast } from 'react-hot-toast';

export default function PromoCodeInput({ 
  carrito, // NUEVO: recibir carrito completo
  onDescuentoAplicado, 
  codigoActual, 
  darkMode = false 
}) {
  const [codigo, setCodigo] = useState('');
  const [validando, setValidando] = useState(false);
  const [subtotalSinDescuento, setSubtotalSinDescuento] = useState(0);
  const [productosExcluidos, setProductosExcluidos] = useState(0);

  // Calcular subtotal solo de productos SIN descuento previo
  useEffect(() => {
    const productosElegibles = carrito.filter(item => {
      // Un producto es elegible si NO tiene descuento activo
      // Asumimos que si el precio del item es diferente al precio original, tiene descuento
      // O podemos verificar si tiene las propiedades de descuento
      return !item.descuento_activo || !item.descuento_porcentaje || item.descuento_porcentaje <= 0;
    });
    
    const productosNoElegibles = carrito.filter(item => {
      return item.descuento_activo && item.descuento_porcentaje > 0;
    });

    const subtotal = productosElegibles.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    
    setSubtotalSinDescuento(subtotal);
    setProductosExcluidos(productosNoElegibles.length);
  }, [carrito]);

  const validarCodigo = async () => {
    if (!codigo.trim()) {
      toast.error('Ingresa un código promocional');
      return;
    }

    if (codigoActual) {
      toast.error('Ya tienes un código aplicado. Elimínalo primero.');
      return;
    }

    if (subtotalSinDescuento <= 0) {
      toast.error('No hay productos elegibles para el descuento. Los productos en oferta no aplican para códigos promocionales.');
      return;
    }

    setValidando(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/validar-codigo-promocional`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ codigo: codigo.trim().toUpperCase() })
      });

      const result = await response.json();

      if (result.valido) {
        // Calcular descuento SOLO sobre productos sin descuento previo
        const descuento = Math.round(subtotalSinDescuento * (result.descuento / 100));
        
        onDescuentoAplicado({
          codigo: result.codigo,
          porcentaje: result.descuento,
          monto: descuento,
          mensaje: result.mensaje,
          subtotalAplicado: subtotalSinDescuento // Para mostrar sobre qué se aplicó
        });

        let mensajeToast = `🎉 ${result.mensaje}`;
        if (productosExcluidos > 0) {
          mensajeToast += `\n💡 Aplicado solo a productos sin descuento previo`;
        }

        toast.success(mensajeToast, {
          duration: 4000,
          icon: '🎫'
        });

        setCodigo('');
      } else {
        toast.error(result.error || 'Código no válido');
      }
    } catch (error) {
      console.error('Error validando código:', error);
      toast.error('Error al validar el código. Intenta de nuevo.');
    } finally {
      setValidando(false);
    }
  };

  const eliminarCodigo = () => {
    onDescuentoAplicado(null);
    toast.success('Código promocional eliminado');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validarCodigo();
  };

  return (
    <div className={`border rounded-lg p-3 sm:p-4 transition-colors duration-300 ${
      darkMode 
        ? 'bg-purple-900 border-purple-700' 
        : 'bg-purple-50 border-purple-200'
    }`}>
      <h4 className={`font-semibold mb-3 flex items-center text-sm sm:text-base transition-colors duration-300 ${
        darkMode ? 'text-purple-300' : 'text-purple-700'
      }`}>
        🎫 Código Promocional
        {subtotalSinDescuento > 0 && (
          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
            darkMode ? 'bg-purple-800 text-purple-300' : 'bg-purple-100 text-purple-600'
          }`}>
            Aplicable: ${subtotalSinDescuento.toLocaleString()}
          </span>
        )}
      </h4>

      {/* Información sobre productos excluidos */}
      {productosExcluidos > 0 && !codigoActual && (
        <div className={`mb-3 p-2 rounded-lg text-xs ${
          darkMode 
            ? 'bg-orange-900 border border-orange-700 text-orange-300' 
            : 'bg-orange-50 border border-orange-200 text-orange-700'
        }`}>
          <div className="flex items-center gap-1">
            <span>ℹ️</span>
            <span>
              {productosExcluidos} producto{productosExcluidos > 1 ? 's' : ''} en oferta excluido{productosExcluidos > 1 ? 's' : ''} del código promocional
            </span>
          </div>
        </div>
      )}

      {codigoActual ? (
        // Mostrar código aplicado
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg space-y-2 sm:space-y-0 transition-colors duration-300 ${
          darkMode 
            ? 'bg-green-900 border border-green-700' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex-1">
            <div className={`font-mono font-bold text-sm sm:text-base transition-colors duration-300 ${
              darkMode ? 'text-green-300' : 'text-green-700'
            }`}>
              {codigoActual.codigo}
            </div>
            <div className={`text-xs sm:text-sm transition-colors duration-300 ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              {codigoActual.porcentaje}% OFF = -${codigoActual.monto.toLocaleString()}
            </div>
            {codigoActual.subtotalAplicado && (
              <div className={`text-xs transition-colors duration-300 ${
                darkMode ? 'text-green-500' : 'text-green-500'
              }`}>
                Sobre ${codigoActual.subtotalAplicado.toLocaleString()} elegibles
              </div>
            )}
          </div>
          <button
            onClick={eliminarCodigo}
            className={`self-end sm:self-auto p-2 rounded-lg transition-colors ${
              darkMode 
                ? 'bg-red-800 text-red-300 hover:bg-red-700' 
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
            title="Eliminar código"
          >
            🗑️
          </button>
        </div>
      ) : (
        // Mostrar input para nuevo código
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="SC2025A0001"
              className={`w-full sm:flex-1 px-3 py-2.5 sm:py-2 rounded-lg text-sm sm:text-base transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-purple-600 text-white placeholder-gray-400' 
                  : 'bg-white border-purple-200 text-gray-900'
              } border focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              disabled={validando || subtotalSinDescuento <= 0}
              maxLength={12}
            />
            <button
              type="submit"
              disabled={validando || !codigo.trim() || subtotalSinDescuento <= 0}
              className={`w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-colors ${
                validando || !codigo.trim() || subtotalSinDescuento <= 0
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
              }`}
            >
              {validando ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-1">⏳</span>
                  Validando...
                </span>
              ) : (
                'Aplicar Código'
              )}
            </button>
          </div>

          {/* Información adicional */}
          <div className={`text-xs space-y-1 transition-colors duration-300 ${
            darkMode ? 'text-purple-400' : 'text-purple-600'
          }`}>
            <p className="flex items-center gap-1">
              
            </p>
            <p className="flex items-center gap-1">
              <span>🎯</span>
              <span>No aplica a productos en oferta</span>
            </p>
            <p className="flex items-center gap-1">
              <span>📝</span>
              <span>Formato: SC2025A0001</span>
            </p>
          </div>
        </form>
      )}
    </div>
  );
}