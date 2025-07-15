import React, { useState, useEffect } from 'react';
import API_URL from '../config/api';

export default function PromotionalPopup() {
  const [promocion, setPromocion] = useState(null);
  const [mostrar, setMostrar] = useState(false);

  useEffect(() => {
    fetchPromocionActiva();
  }, []);

  const fetchPromocionActiva = async () => {
    try {
      console.log('🎉 Buscando promoción popup activa...');
      
      // Verificar si ya se mostró hoy
      const ultimaMuestra = localStorage.getItem('supercasa_popup_last_shown');
      const hoy = new Date().toDateString();
      
      if (ultimaMuestra === hoy) {
        console.log('🎉 Popup ya mostrado hoy, no mostrar de nuevo');
        return;
      }

      // Buscar promoción activa - ✅ LÍNEA CORREGIDA
      const response = await fetch(`${API_URL}/api/promociones-popup`);
      const data = await response.json();
      
      console.log('📄 Respuesta de promociones:', data);
      
      if (data.activa && data.promocion) {
        console.log('✅ Promoción encontrada:', data.promocion.titulo);
        setPromocion(data.promocion);
        setMostrar(true);
        
        // Marcar como mostrado hoy
        localStorage.setItem('supercasa_popup_last_shown', hoy);
      } else {
        console.log('❌ No hay promoción activa');
      }
    } catch (error) {
      console.error('❌ Error obteniendo promoción popup:', error);
    }
  };

  const cerrarPopup = () => {
    console.log('🎉 Cerrando popup promocional');
    setMostrar(false);
  };

  if (!mostrar || !promocion) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
        {/* Botón cerrar */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={cerrarPopup}
            className="bg-gray-800 bg-opacity-75 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-90 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Header con imagen de fondo o gradiente */}
        <div 
          className="relative h-32 bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white"
          style={promocion.imagen_url ? {
            backgroundImage: `url(${promocion.imagen_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          {/* Overlay para mejor legibilidad */}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          
          <div className="relative text-center px-4">
            <h2 className="text-xl font-bold mb-1">
              {promocion.titulo}
            </h2>
            {promocion.descripcion && (
              <p className="text-sm opacity-90">
                {promocion.descripcion}
              </p>
            )}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 text-center">
          <div className="mb-4">
            <div className="text-2xl mb-2">🛍️</div>
            <p className="text-gray-600 text-sm">
              ¡Aprovecha esta oferta especial en SuperCasa!
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={cerrarPopup}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Ahora no
            </button>
            <button
              onClick={() => {
                cerrarPopup();
                // Scroll hacia los productos o categoría específica
                const productosSection = document.getElementById('productos');
                if (productosSection) {
                  productosSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Ver Ofertas
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-3">
            💡 Este mensaje se muestra máximo una vez al día
          </p>
        </div>
      </div>
    </div>
  );
}