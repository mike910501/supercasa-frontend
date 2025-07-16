import React, { useState } from 'react';
import API_URL from '../config/api';
import { toast } from 'react-hot-toast';

export default function PromoCodeInput({ 
  total, 
  onDescuentoAplicado, 
  codigoActual, 
  darkMode = false 
}) {
  const [codigo, setCodigo] = useState('');
  const [validando, setValidando] = useState(false);

  const validarCodigo = async () => {
    if (!codigo.trim()) {
      toast.error('Ingresa un código promocional');
      return;
    }

    if (codigoActual) {
      toast.error('Ya tienes un código aplicado. Elimínalo primero.');
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
        const descuento = Math.round(total * (result.descuento / 100));
        
        onDescuentoAplicado({
          codigo: result.codigo,
          porcentaje: result.descuento,
          monto: descuento,
          mensaje: result.mensaje
        });

        toast.success(`🎉 ${result.mensaje}`, {
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
    <div className={`border rounded-lg p-4 transition-colors duration-300 ${
      darkMode 
        ? 'bg-purple-900 border-purple-700' 
        : 'bg-purple-50 border-purple-200'
    }`}>
      <h4 className={`font-semibold mb-3 flex items-center transition-colors duration-300 ${
        darkMode ? 'text-purple-300' : 'text-purple-700'
      }`}>
        🎫 Código Promocional
      </h4>

      {codigoActual ? (
        // Mostrar código aplicado
        <div className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-300 ${
          darkMode 
            ? 'bg-green-900 border border-green-700' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <div>
            <div className={`font-mono font-bold transition-colors duration-300 ${
              darkMode ? 'text-green-300' : 'text-green-700'
            }`}>
              {codigoActual.codigo}
            </div>
            <div className={`text-sm transition-colors duration-300 ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              {codigoActual.porcentaje}% OFF = -${codigoActual.monto.toLocaleString()}
            </div>
          </div>
          <button
            onClick={eliminarCodigo}
            className={`p-2 rounded-lg transition-colors ${
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
          <div className="flex gap-2">
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="SC2025A0001"
              className={`flex-1 px-3 py-2 rounded-lg transition-colors duration-300 ${
                darkMode 
                  ? 'bg-gray-700 border-purple-600 text-white placeholder-gray-400' 
                  : 'bg-white border-purple-200 text-gray-900'
              } border focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              disabled={validando}
              maxLength={12}
            />
            <button
              type="submit"
              disabled={validando || !codigo.trim()}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                validando || !codigo.trim()
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {validando ? '⏳' : 'Aplicar'}
            </button>
          </div>

          <div className={`text-xs space-y-1 transition-colors duration-300 ${
            darkMode ? 'text-purple-400' : 'text-purple-600'
          }`}>

          </div>
        </form>
      )}
    </div>
  );
}