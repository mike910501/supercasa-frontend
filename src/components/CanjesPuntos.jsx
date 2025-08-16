import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast'; 
import API_URL from '../config/api';

const CanjesPuntos = ({ total, onCanjeAplicado, darkMode = false }) => {
  const [puntosReales, setPuntosReales] = useState(0); // Puntos REALES en BD
  const [puntosMostrados, setPuntosMostrados] = useState(0); // Puntos mostrados (simulación)
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [canjeActual, setCanjeActual] = useState(null);

  useEffect(() => {
    cargarPuntos();
  }, []);

  const cargarPuntos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/api/puntos/mi-saldo`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const puntosDisponibles = data.puntos_disponibles || 0;
        setPuntosReales(puntosDisponibles);
        setPuntosMostrados(puntosDisponibles);
        console.log('✅ Puntos reales cargados:', puntosDisponibles);
      }
    } catch (error) {
      console.error('Error cargando puntos:', error);
    }
  };

  const realizarCanje = async (puntosACanjear) => {
    setCargando(true);
    try {
      const token = localStorage.getItem('token');
      // 🔧 CORREGIDO: Usando API_URL en lugar de localhost:3000
      const response = await fetch(`${API_URL}/api/puntos/canjear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ puntos_a_canjear: puntosACanjear })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const canje = {
          codigo: data.canje.codigo,
          puntos_usados: puntosACanjear,
          valor_descuento: data.canje.valor_descuento
        };
        
        setCanjeActual(canje);
        // Solo actualizar visualmente, NO los puntos reales
        setPuntosMostrados(puntosReales - puntosACanjear);
        
        // Notificar al Store.jsx
        onCanjeAplicado(canje);
        
        setMostrarOpciones(false);
        
        toast.success(
          `¡${puntosACanjear} puntos canjeados! 💎\nDescuento de $${data.canje.valor_descuento.toLocaleString()} aplicado`, 
          {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#10B981',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            },
            icon: '🎉'
          }
        );
        
        console.log('✅ Canje aplicado (puntos NO descontados aún):', canje);
      } else {
        toast.error(data.message || 'Error al realizar el canje', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#EF4444',
            color: 'white',
            fontWeight: 'bold'
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar el canje', {
        duration: 4000,
        position: 'top-center'
      });
    } finally {
      setCargando(false);
    }
  };

  const quitarCanje = async () => {
    console.log('🔄 Cancelando canje...');
    
    if (canjeActual) {
      // Cancelar en el backend
      try {
        const token = localStorage.getItem('token');
        // 🔧 CORREGIDO: Usando API_URL en lugar de localhost:3000
        await fetch(`${API_URL}/api/puntos/cancelar-canje`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ codigo_canje: canjeActual.codigo })
        });
        
        console.log('✅ Canje cancelado en backend');
      } catch (error) {
        console.error('Error cancelando en backend:', error);
      }
      
      // Restaurar puntos visualmente
      setPuntosMostrados(puntosReales);
      console.log(`✅ Puntos restaurados: ${puntosReales}`);
    }
    
    setCanjeActual(null);
    onCanjeAplicado(null);
  };

  const opcionesCanje = [
  { puntos: 50, valor: 500 },    // 🎯 CAMBIO: $500 en lugar de $5,000
  { puntos: 100, valor: 1000 },  // 🎯 CAMBIO: $1,000 en lugar de $10,000
  { puntos: 200, valor: 2200 },  // 🎯 CAMBIO: $2,200 en lugar de $22,000
  { puntos: 500, valor: 6000 }   // 🎯 CAMBIO: $6,000 en lugar de $60,000
];

  // Si no hay puntos
  if (puntosReales === 0 && !canjeActual) {
    return (
      <div className={`rounded-lg p-4 mb-4 border ${
        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <div>
            <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Programa de Puntos
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Aún no tienes puntos disponibles
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si hay un canje aplicado
  if (canjeActual) {
    return (
      <div className="bg-green-50 rounded-lg p-4 mb-4 border-2 border-green-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-800">Descuento por puntos aplicado</p>
              <p className="text-sm text-green-600">
                {canjeActual.puntos_usados} puntos = -${canjeActual.valor_descuento.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Puntos después de confirmar: {puntosMostrados}
              </p>
            </div>
          </div>
          <button
            onClick={quitarCanje}
            className="text-red-600 hover:text-red-800 font-semibold text-sm px-3 py-1 border border-red-300 rounded-lg hover:bg-red-50"
          >
            🔄 Quitar
          </button>
        </div>
      </div>
    );
  }

  // Mostrar opciones de canje
  return (
    <div className={`rounded-lg p-4 mb-4 border-2 ${
      darkMode 
        ? 'bg-purple-900 border-purple-700' 
        : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <div>
            <p className={`font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-800'}`}>
              Usar mis puntos
            </p>
            <p className={`text-sm ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              Tienes <strong>{puntosMostrados}</strong> puntos disponibles
            </p>
          </div>
        </div>
        <button
          onClick={() => setMostrarOpciones(!mostrarOpciones)}
          disabled={puntosMostrados < 50}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            puntosMostrados >= 50
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {mostrarOpciones ? 'Cerrar' : '🎁 Canjear'}
        </button>
      </div>

      {mostrarOpciones && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {opcionesCanje.map(opcion => (
            <button
              key={opcion.puntos}
              onClick={() => realizarCanje(opcion.puntos)}
              disabled={puntosMostrados < opcion.puntos || cargando}
              className={`p-3 rounded-lg border-2 transition-all ${
                puntosMostrados >= opcion.puntos && !cargando
                  ? 'border-purple-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer'
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="text-center">
                <p className={`font-bold ${
                  puntosMostrados >= opcion.puntos ? 'text-purple-600' : 'text-gray-400'
                }`}>
                  {opcion.puntos} pts
                </p>
                <p className="text-xs text-gray-600">
                  = ${opcion.valor.toLocaleString()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CanjesPuntos;