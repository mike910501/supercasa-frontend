// src/pages/TerminosCondiciones.jsx
// TÉRMINOS Y CONDICIONES PARA WHATSAPP
import React from 'react';
import { Link } from 'react-router-dom';
import SupercasaLogo from '../components/SupercasaLogo';

export default function TerminosCondiciones() {
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
            📋 Términos y Condiciones
          </h1>
          <p className="text-xl text-amber-600 font-medium">
            Supercasa - Servicio de Supermercado Virtual
          </p>
          <p className="text-gray-600 mt-4">
            Última actualización: Enero 2024
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border-2 border-amber-200">
          
          {/* Introducción */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              🏗️ 1. Introducción
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <p className="mb-4">
                Bienvenido a <strong>Supercasa</strong>. Estos términos y condiciones ("Términos") regulan 
                el uso de nuestro servicio de supermercado virtual especializado en abarrotes para el 
                conjunto residencial Torres de Bellavista.
              </p>
              <p className="mb-4">
                Al utilizar nuestro servicio, ya sea a través de nuestra página web 
                <strong> tiendasupercasa.com</strong> o nuestra aplicación, usted acepta estar sujeto a 
                estos Términos y Condiciones.
              </p>
              <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500 mt-6">
                <p><strong>Datos de la empresa:</strong></p>
                <p>Nombre comercial: Supercasa</p>
                <p>Servicio: Supermercado virtual de abarrotes</p>
                <p>Ubicación: Conjunto Torres de Bellavista, Bogotá D.C.</p>
                <p>Contacto: contacto@tiendasupercasa.com | WhatsApp: 300 139 9242</p>
              </div>
            </div>
          </section>

          {/* Servicios */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              🛒 2. Descripción del Servicio
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <p className="mb-4">
                <strong>Supercasa</strong> ofrece un servicio de venta y entrega de abarrotes 
                exclusivamente para residentes del conjunto residencial Torres de Bellavista.
              </p>
              
              <h3 className="font-bold text-gray-800 mt-6 mb-3">Servicios incluidos:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Venta de productos de abarrotes (alimentos, bebidas, artículos de aseo)</li>
                <li>Entrega a domicilio en las 5 torres del conjunto</li>
                <li>Múltiples métodos de pago (efectivo, digital)</li>
                <li>Atención al cliente vía WhatsApp y email</li>
                <li>Horario de servicio: 6:00 AM - 11:00 PM, todos los días</li>
              </ul>

              <h3 className="font-bold text-gray-800 mt-6 mb-3">Compromiso de entrega:</h3>
              <p className="mb-4">
                Nos comprometemos a realizar entregas en <strong>máximo 20 minutos</strong> 
                dentro del horario de servicio establecido.
              </p>
            </div>
          </section>

          {/* Elegibilidad */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              👤 3. Elegibilidad y Registro
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <h3 className="font-bold text-gray-800 mb-3">Requisitos para el registro:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Ser residente o tener autorización para recibir entregas en Torres de Bellavista</li>
                <li>Ser mayor de 18 años o contar con autorización parental</li>
                <li>Proporcionar información veraz y actualizada</li>
                <li>Tener un número de teléfono válido para confirmación de entregas</li>
              </ul>

              <h3 className="font-bold text-gray-800 mb-3">Información requerida:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Nombre completo</li>
                <li>Número de cédula</li>
                <li>Email válido</li>
                <li>Teléfono de contacto</li>
                <li>Torre, piso y apartamento</li>
              </ul>
            </div>
          </section>

          {/* Pedidos y Precios */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              💰 4. Pedidos y Precios
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <h3 className="font-bold text-gray-800 mb-3">Política de precios:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Los precios están expresados en pesos colombianos (COP)</li>
                <li>Los precios incluyen IVA cuando aplique</li>
                <li>Los precios pueden variar sin previo aviso</li>
                <li>El precio final es el mostrado al momento de confirmar el pedido</li>
              </ul>

              <h3 className="font-bold text-gray-800 mb-3">Pedidos mínimos:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Pago en efectivo:</strong> $15,000 COP mínimo</li>
                <li><strong>Pagos digitales:</strong> $20,000 COP mínimo</li>
                <li><strong>Domicilio:</strong> Sin costo adicional dentro del conjunto</li>
              </ul>

              <h3 className="font-bold text-gray-800 mb-3">Disponibilidad:</h3>
              <p className="mb-4">
                Los productos están sujetos a disponibilidad. En caso de no tener stock, 
                nos comunicaremos inmediatamente para ofrecer alternativas o reembolso.
              </p>
            </div>
          </section>

          {/* Métodos de Pago */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              💳 5. Métodos de Pago
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <h3 className="font-bold text-gray-800 mb-3">Métodos aceptados:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Efectivo:</strong> Pago al momento de la entrega</li>
                <li><strong>Tarjetas:</strong> Crédito y débito a través de pasarela segura</li>
                <li><strong>PSE:</strong> Transferencia bancaria</li>
                <li><strong>Nequi:</strong> Pagos móviles</li>
                <li><strong>Otros:</strong> Medios digitales habilitados</li>
              </ul>

              <h3 className="font-bold text-gray-800 mb-3">Política de reembolsos:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Productos dañados o en mal estado: Reembolso completo</li>
                <li>Cancelación antes de preparar el pedido: Reembolso completo</li>
                <li>Productos perecederos: No se aceptan devoluciones salvo defecto</li>
                <li>Tiempo de procesamiento: 3-5 días hábiles</li>
              </ul>
            </div>
          </section>

          {/* Entrega */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              🚚 6. Política de Entrega
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <h3 className="font-bold text-gray-800 mb-3">Área de cobertura:</h3>
              <p className="mb-4">
                Servicio exclusivo para el conjunto residencial Torres de Bellavista, 
                ubicado en Tv 70 d bis a 68 75 sur, Bogotá D.C.
              </p>

              <h3 className="font-bold text-gray-800 mb-3">Tiempos de entrega:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Tiempo estándar:</strong> Máximo 20 minutos</li>
                <li><strong>Horario:</strong> 6:00 AM - 11:00 PM, todos los días</li>
                <li><strong>Confirmación:</strong> Llamada previa antes de la entrega</li>
              </ul>

              <h3 className="font-bold text-gray-800 mb-3">Responsabilidades del cliente:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Estar disponible en la dirección proporcionada</li>
                <li>Verificar los productos al momento de la entrega</li>
                <li>Reportar inmediatamente cualquier inconformidad</li>
                <li>Proporcionar instrucciones claras de ubicación</li>
              </ul>
            </div>
          </section>

          {/* Uso Responsable */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              ⚖️ 7. Uso Responsable del Servicio
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <h3 className="font-bold text-gray-800 mb-3">Prohibiciones:</h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Uso del servicio para actividades ilegales</li>
                <li>Proporcionar información falsa o engañosa</li>
                <li>Reventa de productos adquiridos</li>
                <li>Abuso del sistema de atención al cliente</li>
                <li>Interferencia con el funcionamiento del servicio</li>
              </ul>

              <h3 className="font-bold text-gray-800 mb-3">Consecuencias del incumplimiento:</h3>
              <p className="mb-4">
                El incumplimiento de estos términos puede resultar en la suspensión 
                temporal o permanente del servicio, sin derecho a reembolso.
              </p>
            </div>
          </section>

          {/* Limitación de Responsabilidad */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              🛡️ 8. Limitación de Responsabilidad
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Supercasa no es responsable por demoras causadas por factores externos (clima, emergencias, etc.)</li>
                <li>La responsabilidad máxima se limita al valor del pedido afectado</li>
                <li>No somos responsables por el uso inadecuado de los productos</li>
                <li>Los productos perecederos deben consumirse según indicaciones del fabricante</li>
              </ul>
            </div>
          </section>

          {/* Protección de Datos */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              🔒 9. Protección de Datos Personales
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <p className="mb-4">
                Supercasa cumple con la Ley 1581 de 2012 de Protección de Datos Personales 
                y su decreto reglamentario. Para más información, consulte nuestra 
                <Link to="/privacidad" className="text-amber-600 hover:text-amber-700 font-medium"> Política de Privacidad</Link>.
              </p>
            </div>
          </section>

          {/* Modificaciones */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              📝 10. Modificaciones a los Términos
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <p className="mb-4">
                Supercasa se reserva el derecho de modificar estos términos en cualquier momento. 
                Las modificaciones serán notificadas a través de nuestros canales oficiales y 
                entrarán en vigencia inmediatamente después de su publicación.
              </p>
              <p className="mb-4">
                El uso continuado del servicio después de las modificaciones constituye 
                aceptación de los nuevos términos.
              </p>
            </div>
          </section>

          {/* Resolución de Conflictos */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              ⚖️ 11. Resolución de Conflictos
            </h2>
            <div className="prose prose-lg text-gray-700 leading-relaxed">
              <p className="mb-4">
                Para resolver cualquier disputa o reclamación, el cliente debe contactar 
                primero a nuestro servicio de atención al cliente:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>WhatsApp:</strong> 300 139 9242</li>
                <li><strong>Email:</strong> contacto@tiendasupercasa.com</li>
              </ul>
              <p className="mb-4">
                Si no es posible resolver el conflicto directamente, las partes se someterán 
                a la jurisdicción de los tribunales competentes de Bogotá D.C., Colombia.
              </p>
            </div>
          </section>

          {/* Contacto */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-amber-700 mb-6">
              📞 12. Información de Contacto
            </h2>
            <div className="bg-amber-50 p-6 rounded-xl border-l-4 border-amber-500">
              <p className="mb-2"><strong>Supercasa</strong></p>
              <p className="mb-2">Servicio de supermercado virtual</p>
              <p className="mb-2"><strong>Ubicación:</strong> Torres de Bellavista, Tv 70 d bis a 68 75 sur, Bogotá D.C.</p>
              <p className="mb-2"><strong>WhatsApp:</strong> 300 139 9242</p>
              <p className="mb-2"><strong>Email:</strong> contacto@tiendasupercasa.com</p>
              <p className="mb-2"><strong>Horario:</strong> 6:00 AM - 11:00 PM, todos los días</p>
              <p><strong>Web:</strong> tiendasupercasa.com</p>
            </div>
          </section>

        </div>

        {/* Fecha de última actualización */}
        <div className="text-center mt-12 text-gray-600">
          <p>Términos y Condiciones vigentes desde Enero 2024</p>
          <p className="mt-2">
            Para consultas sobre estos términos, contáctanos en: 
            <a href="mailto:contacto@tiendasupercasa.com" className="text-amber-600 hover:text-amber-700 font-medium"> contacto@tiendasupercasa.com</a>
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
            <Link to="/privacidad" className="text-gray-400 hover:text-amber-400">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}