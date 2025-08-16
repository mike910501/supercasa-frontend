import React, { useState, useEffect } from 'react';

const PuntosWidget = () => {
  const [puntos, setPuntos] = useState(0);
  const [nivel, setNivel] = useState('BRONCE');
  const [puntosTotales, setPuntosTotales] = useState(0);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarPuntos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setCargando(false);
          return;
        }

        // ✅ URL COMPLETA CON PUERTO
        const response = await fetch('http://localhost:3000/api/puntos/mi-saldo', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPuntos(data.puntos_disponibles || 0);
          setNivel(data.nivel || 'BRONCE');
          setPuntosTotales(data.puntos_totales || 0);
        }
      } catch (error) {
        console.error('Error cargando puntos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarPuntos();
    
    // Actualizar cada 10 segundos
    const interval = setInterval(cargarPuntos, 10000);
    
    // Escuchar evento de pedido completado
    window.addEventListener('pedidoCompletado', cargarPuntos);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('pedidoCompletado', cargarPuntos);
    };
  }, []);

  const getNivelColor = () => {
    switch(nivel) {
      case 'ORO': return 'from-yellow-400 to-yellow-600';
      case 'PLATA': return 'from-gray-300 to-gray-500';
      default: return 'from-orange-400 to-orange-600';
    }
  };

  const getProximoNivel = () => {
    switch(nivel) {
      case 'BRONCE': return { nombre: 'PLATA', puntos: 500 };
      case 'PLATA': return { nombre: 'ORO', puntos: 1500 };
      default: return null;
    }
  };

  const proximoNivel = getProximoNivel();
  const progreso = proximoNivel ? 
    ((puntosTotales % proximoNivel.puntos) / proximoNivel.puntos) * 100 : 100;

  if (cargando) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-full px-3 py-1 w-32 h-8"></div>
    );
  }

  return (
    <>
      <button
        onClick={() => setMostrarPanel(!mostrarPanel)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getNivelColor()} text-white font-semibold text-sm hover:scale-105 transition-all duration-300 shadow-lg`}
      >
        <span className="text-lg">🏆</span>
        <span>Mis Puntos: {puntos} pts</span>
        <span className={`px-2 py-0.5 rounded-full text-xs ${
          nivel === 'ORO' ? 'bg-yellow-300 text-yellow-900' :
          nivel === 'PLATA' ? 'bg-gray-200 text-gray-800' :
          'bg-orange-300 text-orange-900'
        }`}>
          {nivel}
        </span>
      </button>

      {mostrarPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
             onClick={() => setMostrarPanel(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
               onClick={(e) => e.stopPropagation()}>
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Mi Programa de Puntos</h2>
              <button 
                onClick={() => setMostrarPanel(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className={`bg-gradient-to-r ${getNivelColor()} rounded-xl p-6 mb-6 text-white`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm opacity-90">Saldo disponible</p>
                  <p className="text-3xl font-bold">{puntos} pts</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Nivel actual</p>
                  <p className="text-2xl font-bold">{nivel}</p>
                </div>
              </div>
              
              {proximoNivel && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso a {proximoNivel.nombre}</span>
                    <span>{puntosTotales}/{proximoNivel.puntos}</span>
                  </div>
                  <div className="bg-white bg-opacity-30 rounded-full h-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${progreso}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                🎁 Ver Recompensas
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors">
                📜 Historial
              </button>
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                💡 <strong>Tip:</strong> Ganas 1 punto por cada $1,000 en compras
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PuntosWidget;