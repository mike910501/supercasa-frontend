import React, { useState } from 'react';

// 🏗️ COMPONENTE DE AUTORIZACIÓN ESPECÍFICO PARA SUPERCASA - SIN LUCIDE-REACT
const AutorizacionDatos = ({ 
  darkMode, 
  onAuthChange, 
  showModal, 
  setShowModal, 
  isLoading = false 
}) => {
  const [authorized, setAuthorized] = useState(false);
  const [marketingAuthorized, setMarketingAuthorized] = useState(false);

  const handleAuthorizationChange = (type, value) => {
    if (type === 'main') {
      setAuthorized(value);
      onAuthChange({ main: value, marketing: marketingAuthorized });
    } else {
      setMarketingAuthorized(value);
      onAuthChange({ main: authorized, marketing: value });
    }
  };

  return (
    <div className="space-y-4">
      {/* AUTORIZACIÓN PRINCIPAL SUPERCASA */}
      <div className={`p-4 rounded-xl border-2 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-700 border-amber-600' 
          : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300'
      }`}>
        <h3 className="font-semibold text-amber-600 mb-3 flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          🏗️ Autorización SuperCasa - Tratamiento de Datos
        </h3>
        
        {/* AUTORIZACIÓN OBLIGATORIA */}
        <label className="flex items-start gap-3 mb-4 cursor-pointer group">
          <input
            type="checkbox"
            checked={authorized}
            onChange={(e) => handleAuthorizationChange('main', e.target.checked)}
            disabled={isLoading}
            className="mt-1 w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 disabled:opacity-50"
            required
          />
          <div className="text-sm">
            <span className="text-red-500 font-bold">* OBLIGATORIO:</span> Autorizo a <strong>SuperCasa S.A.S.</strong> para recolectar, almacenar, usar y tratar mis datos personales (cédula, email, teléfono, torre, piso, apartamento) para:
            <ul className="list-disc list-inside mt-2 space-y-1 text-xs pl-4">
              <li>🏗️ Procesar pedidos y entregas en mi ubicación específica del conjunto</li>
              <li>📱 Comunicación sobre mis pedidos y estado de entrega</li>
              <li>📄 Facturación y cumplimiento de obligaciones legales</li>
              <li>🛡️ Seguridad y prevención de fraudes</li>
            </ul>
            <p className="mt-2">
              De acuerdo con la{' '}
              <button
                onClick={() => setShowModal(true)}
                disabled={isLoading}
                className="text-amber-600 hover:text-amber-700 underline font-semibold disabled:opacity-50"
              >
                Política de Tratamiento de Datos Personales
              </button>
              {' '}de SuperCasa.
            </p>
          </div>
        </label>

        {/* AUTORIZACIÓN OPCIONAL MARKETING */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={marketingAuthorized}
            onChange={(e) => handleAuthorizationChange('marketing', e.target.checked)}
            disabled={isLoading}
            className="mt-1 w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2 disabled:opacity-50"
          />
          <div className="text-sm">
            <span className="text-green-600 font-semibold">(Opcional)</span> Autorizo recibir:
            <ul className="list-disc list-inside mt-1 space-y-1 text-xs pl-4">
              <li>📧 Promociones y ofertas especiales de SuperCasa</li>
              <li>🎯 Comunicaciones comerciales personalizadas</li>
              <li>📱 Notificaciones sobre nuevos productos y descuentos</li>
              <li>🏗️ Información sobre mejoras en el servicio del conjunto</li>
            </ul>
          </div>
        </label>

        {/* INDICADORES VISUALES */}
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className={`flex items-center gap-1 ${authorized ? 'text-green-600' : 'text-gray-400'}`}>
            <span className="text-base">✅</span>
            <span>Autorización principal {authorized ? '✅' : '⏳'}</span>
          </div>
          <div className={`flex items-center gap-1 ${marketingAuthorized ? 'text-blue-600' : 'text-gray-400'}`}>
            <span className="text-base">✅</span>
            <span>Marketing {marketingAuthorized ? '✅' : '(opcional)'}</span>
          </div>
        </div>
      </div>

      {/* INFORMACIÓN ADICIONAL SUPERCASA */}
      <div className={`p-3 rounded-lg text-xs space-y-2 transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-700 border border-blue-600' 
          : 'bg-blue-50 border border-blue-200'
      }`}>
        <div className="flex items-start gap-2">
          <span className="text-blue-500 text-base">ℹ️</span>
          <div>
            <strong>🏗️ ¿Por qué SuperCasa necesita estos datos?</strong><br/>
            Para garantizar entregas precisas en tu apartamento específico del conjunto residencial (Torre, Piso, Apartamento) y brindarte nuestro servicio de "supermercado en casa" en máximo 20 minutos.
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-green-500 text-base">🛡️</span>
          <div>
            <strong>🔒 Protección garantizada:</strong> Tus datos están seguros con cifrado de grado militar. SuperCasa nunca venderá tu información a terceros. Solo la usamos para mejorar tu experiencia de compra.
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-purple-500 text-base">👁️</span>
          <div>
            <strong>📝 Tus derechos:</strong> Puedes acceder, rectificar, actualizar o eliminar tus datos cuando quieras contactando a <span className="text-amber-600">privacidad@supercasa.co</span>
          </div>
        </div>
      </div>

      {/* MODAL DE POLÍTICA COMPLETA */}
      {showModal && (
        <PolicyModal 
          darkMode={darkMode} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
};

// 🏗️ MODAL DE POLÍTICA COMPLETA SUPERCASA - SIN LUCIDE-REACT
const PolicyModal = ({ darkMode, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transition-colors duration-300 border-2 ${
        darkMode 
          ? 'bg-gray-800 border-amber-600' 
          : 'bg-white border-amber-300'
      }`}>
        <div className={`flex justify-between items-center p-6 border-b transition-colors duration-300 ${
          darkMode ? 'border-amber-600' : 'border-amber-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏗️</div>
            <div>
              <h2 className={`text-xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>SuperCasa - Política de Tratamiento de Datos</h2>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-amber-400' : 'text-amber-600'
              }`}>Conjunto Residencial Las Torres - Última actualización: Julio 2025</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors duration-300 text-2xl ${
              darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            ❌
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="space-y-6">
            
            {/* 1. RESPONSABLE */}
            <section>
              <h3 className="text-lg font-semibold mb-3 text-amber-600 flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                1. IDENTIFICACIÓN DEL RESPONSABLE
              </h3>
              <div className={`p-4 rounded-lg transition-colors duration-300 ${
                darkMode ? 'bg-gray-700' : 'bg-amber-50'
              }`}>
                <p><strong>Razón Social:</strong> SuperCasa S.A.S.</p>
                <p><strong>NIT:</strong> 900.XXX.XXX-X</p>
                <p><strong>Dirección:</strong> Conjunto Residencial Las Torres, Bogotá D.C., Colombia</p>
                <p><strong>Teléfono:</strong> (+57) 601 XXX-XXXX</p>
                <p><strong>Email:</strong> privacidad@supercasa.co</p>
                <p><strong>Actividad:</strong> E-commerce de supermercado para conjunto residencial</p>
              </div>
            </section>

            {/* 2. FINALIDADES */}
            <section>
              <h3 className="text-lg font-semibold mb-3 text-amber-600">2. ¿PARA QUÉ USA SUPERCASA TUS DATOS?</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700' : 'bg-blue-50'
                }`}>
                  <h4 className="font-semibold mb-2">🛒 Servicios Principales:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Procesar y entregar pedidos en tu apartamento específico</li>
                    <li>Garantizar entregas en máximo 20 minutos</li>
                    <li>Comunicación sobre estado de pedidos</li>
                    <li>Facturación y proceso de pagos</li>
                    <li>Atención al cliente y soporte técnico</li>
                  </ul>
                </div>
                
                <div className={`p-4 rounded-lg transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700' : 'bg-green-50'
                }`}>
                  <h4 className="font-semibold mb-2">🎯 Marketing Personalizado:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Ofertas personalizadas según historial</li>
                    <li>Promociones especiales para el conjunto</li>
                    <li>Comunicaciones comerciales vía email/SMS</li>
                    <li>Notificaciones push sobre descuentos</li>
                    <li>Programa de fidelización de clientes</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. TUS DERECHOS */}
            <section>
              <h3 className="text-lg font-semibold mb-3 text-amber-600">3. TUS DERECHOS COMO TITULAR</h3>
              <div className={`p-4 rounded-lg transition-colors duration-300 ${
                darkMode ? 'bg-gray-700' : 'bg-amber-50'
              }`}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">📋 Derecho de Acceso:</h4>
                    <p className="text-sm">Conocer qué datos personales tenemos sobre ti.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">✏️ Derecho de Rectificación:</h4>
                    <p className="text-sm">Solicitar corrección de datos inexactos.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">🗑️ Derecho de Supresión:</h4>
                    <p className="text-sm">Pedir eliminación de tus datos.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">⏸️ Derecho de Oposición:</h4>
                    <p className="text-sm">Oponerte al tratamiento para marketing.</p>
                  </div>
                </div>
                <div className="mt-4 text-center p-3 border rounded-lg border-amber-300">
                  <p className="font-semibold">📞 Para ejercer tus derechos:</p>
                  <p className="text-sm mt-1">
                    Email: <span className="text-amber-600 font-medium">privacidad@supercasa.co</span><br/>
                    Teléfono: <span className="text-amber-600 font-medium">(+57) 601 XXX-XXXX</span>
                  </p>
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <div className="text-center pt-6 border-t border-gray-300">
              <div className="flex items-center justify-center gap-3 text-amber-600">
                <span className="text-lg">🛡️</span>
                <span className="font-semibold">🏗️ SuperCasa protege tus datos con la máxima seguridad</span>
                <span className="text-lg">🛡️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutorizacionDatos;