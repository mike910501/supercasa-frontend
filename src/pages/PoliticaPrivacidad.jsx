// src/pages/PoliticaPrivacidad.jsx
// POLÍTICA DE PRIVACIDAD PARA WHATSAPP
import React from 'react';
import { Link } from 'react-router-dom';
import SupercasaLogo from '../components/SupercasaLogo';

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-2 border-amber-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <SupercasaLogo 
                size="large"
                showText={true}
                showSlogan={false}
                darkMode={false}
              />
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-amber-600 hover:text-amber-700 font-medium">Inicio</Link>
              <Link to="/contacto" className="text-amber-600 hover:text-amber-700 font-medium">Contacto</Link>
              <Link to="/app" className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 py-2 rounded-xl hover:from-amber-600 hover:to-yellow-700 font-medium shadow-lg">
                🏗️ Ingresar a Supercasa
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Título */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🔒 Política de Privacidad
          </h1>
          <p className="text-xl text-amber-600 font-medium">
            Protección de Datos Personales - Supercasa
          </p>
          <p className="text-gray-600 mt-4">
            Última actualización: Enero 2024
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border-2 border-amber-200">
          
          {/* Introducción */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              📋 1. Introducción
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <p className="mb-4">
                En <strong>Supercasa</strong>, respetamos y protegemos la privacidad de nuestros usuarios. 
                Esta Política de Privacidad describe cómo recolectamos, usamos, almacenamos y protegemos 
                sus datos personales de acuerdo con la <strong>Ley 1581 de 2012</strong> de Protección de 
                Datos Personales de Colombia y su decreto reglamentario.
              </p>
              
              <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500 mt-6">
                <h3 className="font-bold text-blue-800 mb-2">Responsable del Tratamiento:</h3>
                <p><strong>Supercasa</strong></p>
                <p>Servicio de supermercado virtual</p>
                <p><strong>Contacto DPO:</strong> privacidad@tiendasupercasa.com</p>
                <p><strong>WhatsApp:</strong> 300 139 9242</p>
                <p><strong>Dirección:</strong> Torres de Bellavista, Tv 70 d bis a 68 75 sur, Bogotá D.C.</p>
              </div>
            </div>
          </section>

          {/* Datos que Recolectamos */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              📊 2. Datos Personales que Recolectamos
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              
              <h3 className="font-bold text-gray-800 mb-3">2.1 Datos de Identificación:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Nombre completo</li>
                <li>Número de cédula de ciudadanía</li>
                <li>Fecha de nacimiento (cuando aplique)</li>
              </ul>

              <h3 className="font-bold text-gray-800 mb-3">2.2 Datos de Contacto:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Dirección de email</li>
                <li>Número de teléfono móvil</li>
                <li>Número de teléfono alternativo (opcional)</li>
              </ul>

              <h3 className="font-bold text-gray-800 mb-3">2.3 Datos de Ubicación:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Torre del conjunto residencial</li>
                <li>Número de piso</li>
                <li>Número de apartamento</li>
                <li>Instrucciones de entrega específicas</li>
              </ul>

              <h3 className="font-bold text-gray-800 mb-3">2.4 Datos Transaccionales:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Historial de pedidos</li>
                <li>Métodos de pago utilizados</li>
                <li>Fechas y horarios de entregas</li>
                <li>Preferencias de productos</li>
              </ul>

              <h3 className="font-bold text-gray-800 mb-3">2.5 Datos Técnicos:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Dirección IP</li>
                <li>Información del navegador</li>
                <li>Cookies y tecnologías similares</li>
                <li>Datos de uso de la plataforma</li>
              </ul>
            </div>
          </section>

          {/* Finalidades del Tratamiento */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              🎯 3. Finalidades del Tratamiento
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              
              <h3 className="font-bold text-gray-800 mb-3">3.1 Finalidades Principales:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Procesamiento de pedidos:</strong> Gestionar sus compras y entregas</li>
                <li><strong>Comunicación de entregas:</strong> Confirmar horarios y ubicación</li>
                <li><strong>Facturación:</strong> Generar facturas y comprobantes de compra</li>
                <li><strong>Atención al cliente:</strong> Resolver consultas y brindar soporte</li>
                <li><strong>Seguridad:</strong> Verificar identidad y prevenir fraudes</li>
              </ul>

              <h3 className="font-bold text-gray-800 mb-3">3.2 Finalidades Secundarias (Opcionales):</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Marketing:</strong> Envío de promociones y ofertas especiales</li>
                <li><strong>Comunicaciones comerciales:</strong> Información sobre nuevos productos</li>
                <li><strong>Mejora del servicio:</strong> Análisis de preferencias y comportamiento</li>
                <li><strong>Programas de fidelización:</strong> Beneficios para clientes frecuentes</li>
              </ul>

              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 mt-6">
                <p><strong>💡 Importante:</strong> Las finalidades secundarias requieren su autorización expresa. 
                Puede aceptar o rechazar estas comunicaciones sin afectar el servicio principal.</p>
              </div>
            </div>
          </section>

          {/* Base Legal */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              ⚖️ 4. Base Legal del Tratamiento
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Consentimiento informado:</strong> Para el tratamiento de datos personales</li>
                <li><strong>Ejecución contractual:</strong> Para cumplir con nuestros servicios</li>
                <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios y seguridad</li>
                <li><strong>Obligación legal:</strong> Para cumplir con normas fiscales y contables</li>
              </ul>
            </div>
          </section>

          {/* Compartir Información */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              🤝 5. Compartir Información con Terceros
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              
              <h3 className="font-bold text-gray-800 mb-3">Compartimos datos únicamente con:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Procesadores de pago:</strong> Para procesar transacciones seguras (WOMPI, bancos)</li>
                <li><strong>Proveedores de tecnología:</strong> Para el funcionamiento de la plataforma</li>
                <li><strong>Autoridades:</strong> Cuando sea requerido por ley</li>
                <li><strong>Repartidores:</strong> Solo datos necesarios para la entrega (nombre, dirección, teléfono)</li>
              </ul>

              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 mt-6">
                <p><strong>🚫 NO vendemos ni comercializamos</strong> sus datos personales con terceros para fines publicitarios.</p>
              </div>
            </div>
          </section>

          {/* Derechos del Titular */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              👤 6. Sus Derechos como Titular
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              
              <p className="mb-4">Como titular de datos personales, usted tiene los siguientes derechos:</p>
              
              <h3 className="font-bold text-gray-800 mb-3">Derechos fundamentales:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre usted</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>Actualización:</strong> Mantener sus datos al día</li>
                <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos</li>
                <li><strong>Revocación:</strong> Retirar la autorización en cualquier momento</li>
                <li><strong>Limitación:</strong> Restringir el uso de sus datos</li>
                <li><strong>Portabilidad:</strong> Obtener una copia de sus datos</li>
              </ul>

              <h3 className="font-bold text-gray-800 mb-3">¿Cómo ejercer sus derechos?</h3>
              <div className="bg-amber-50 p-6 rounded-xl border-l-4 border-amber-500">
                <p className="mb-2"><strong>📧 Email:</strong> privacidad@tiendasupercasa.com</p>
                <p className="mb-2"><strong>📱 WhatsApp:</strong> 300 139 9242</p>
                <p className="mb-2"><strong>⏱️ Tiempo de respuesta:</strong> Máximo 15 días hábiles</p>
                <p><strong>📋 Requisitos:</strong> Debe identificarse y especificar claramente su solicitud</p>
              </div>
            </div>
          </section>

          {/* Seguridad */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              🔐 7. Medidas de Seguridad
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              
              <h3 className="font-bold text-gray-800 mb-3">Protección técnica:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Cifrado SSL/TLS para transmisión de datos</li>
                <li>Servidores seguros con acceso restringido</li>
                <li>Copias de seguridad regulares</li>
                <li>Monitoreo continuo de seguridad</li>
              </ul>

              <h3 className="font-bold text-gray-800 mb-3">Protección administrativa:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Acceso limitado solo a personal autorizado</li>
                <li>Capacitación en protección de datos</li>
                <li>Políticas internas de seguridad</li>
                <li>Auditorías periódicas</li>
              </ul>
            </div>
          </section>

          {/* Retención de Datos */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              📅 8. Tiempo de Retención
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              
              <h3 className="font-bold text-gray-800 mb-3">Plazos de conservación:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Datos de cuenta activa:</strong> Mientras mantenga su cuenta</li>
                <li><strong>Historial de pedidos:</strong> 5 años (obligación fiscal)</li>
                <li><strong>Datos de marketing:</strong> Hasta que revoque su autorización</li>
                <li><strong>Datos técnicos:</strong> 2 años máximo</li>
                <li><strong>Cuenta inactiva:</strong> 3 años sin actividad, luego eliminación</li>
              </ul>

              <p className="mb-4">
                Después de estos plazos, los datos serán eliminados de forma segura, 
                excepto cuando la ley requiera conservarlos por más tiempo.
              </p>
            </div>
          </section>

          {/* Transferencias Internacionales */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              🌍 9. Transferencias Internacionales
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <p className="mb-4">
                Algunos de nuestros proveedores de servicios tecnológicos pueden estar ubicados 
                fuera de Colombia. En estos casos:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Solo trabajamos con empresas que garantizan nivel adecuado de protección</li>
                <li>Establecemos contratos con cláusulas de protección de datos</li>
                <li>Verificamos que cumplan con estándares internacionales</li>
                <li>Le informamos cuando esto ocurra</li>
              </ul>
            </div>
          </section>

          {/* Menores de Edad */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              👶 10. Menores de Edad
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <p className="mb-4">
                Nuestro servicio está dirigido a personas mayores de 18 años. Si un menor de edad 
                necesita usar el servicio:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Debe contar con autorización expresa de sus padres o tutores</li>
                <li>Los padres/tutores son responsables del uso del servicio</li>
                <li>Aplicamos protecciones especiales para datos de menores</li>
                <li>Si detectamos datos de menores sin autorización, los eliminaremos</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              🍪 11. Uso de Cookies
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              
              <h3 className="font-bold text-gray-800 mb-3">Tipos de cookies que usamos:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Esenciales:</strong> Necesarias para el funcionamiento del sitio</li>
                <li><strong>Funcionales:</strong> Recordar sus preferencias</li>
                <li><strong>Analíticas:</strong> Entender cómo usa nuestro servicio</li>
                <li><strong>Marketing:</strong> Personalizar ofertas (solo con su consentimiento)</li>
              </ul>

              <p className="mb-4">
                Puede configurar su navegador para rechazar cookies, aunque esto puede afectar 
                algunas funcionalidades del servicio.
              </p>
            </div>
          </section>

          {/* Cambios en la Política */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              📝 12. Cambios en esta Política
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <p className="mb-4">
                Podemos actualizar esta Política de Privacidad periódicamente. Cuando lo hagamos:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Le notificaremos por email o WhatsApp</li>
                <li>Publicaremos la nueva versión en nuestro sitio web</li>
                <li>Indicaremos la fecha de la última actualización</li>
                <li>Para cambios importantes, solicitaremos su consentimiento nuevamente</li>
              </ul>
            </div>
          </section>

          {/* Contacto para Privacidad */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              📞 13. Contacto para Temas de Privacidad
            </h2>
            <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
              <h3 className="font-bold text-blue-800 mb-4">Oficial de Protección de Datos (DPO)</h3>
              <p className="mb-2"><strong>Email especializado:</strong> privacidad@tiendasupercasa.com</p>
              <p className="mb-2"><strong>WhatsApp:</strong> 300 139 9242 (mencionar "tema de privacidad")</p>
              <p className="mb-2"><strong>Horario de atención:</strong> Lunes a viernes, 8:00 AM - 6:00 PM</p>
              <p className="mb-2"><strong>Tiempo de respuesta:</strong> Máximo 15 días hábiles</p>
              <p><strong>Dirección postal:</strong> Torres de Bellavista, Tv 70 d bis a 68 75 sur, Bogotá D.C.</p>
            </div>
          </section>

        </div>

        {/* Fecha de vigencia */}
        <div className="text-center mt-12 text-gray-600">
          <p>Política de Privacidad vigente desde Enero 2024</p>
          <p className="mt-2">
            Para consultas sobre privacidad y protección de datos: 
            <a href="mailto:privacidad@tiendasupercasa.com" className="text-amber-600 hover:text-amber-700 font-medium"> privacidad@tiendasupercasa.com</a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <SupercasaLogo 
            size="medium"
            showText={true}
            showSlogan={false}
            darkMode={true}
            className="justify-center mb-4"
          />
          <p className="text-gray-400">© 2024 Supercasa. Todos los derechos reservados.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <Link to="/" className="text-gray-400 hover:text-amber-400">Inicio</Link>
            <Link to="/quienes-somos" className="text-gray-400 hover:text-amber-400">Quiénes Somos</Link>
            <Link to="/contacto" className="text-gray-400 hover:text-amber-400">Contacto</Link>
            <Link to="/terminos" className="text-gray-400 hover:text-amber-400">Términos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}