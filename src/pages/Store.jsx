import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_URL, { api } from '../config/api';
import { toast } from 'react-hot-toast';
import { restoreCartAfterLogin, hasTemporaryCart } from '../utils/authHandler';
import PaymentComponent from '../components/PaymentComponent';
import ChatWidget from '../components/ChatWidget';
import SupercasaLogo from '../components/SupercasaLogo';
import '../styles/supercasa-animations.css';
import AutorizacionDatos from '../components/AutorizacionDatos';
import PromotionalPopup from '../components/PromotionalPopup';
import PromoCodeInput from '../components/PromoCodeInput';
import PuntosWidget from '../components/PuntosWidget';
import CanjesPuntos from '../components/CanjesPuntos';

// Aplicación principal que maneja autenticación
export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        console.log('Sesión restaurada para:', JSON.parse(savedUser).nombre);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData, userToken) => {
    console.log('Login exitoso, configurando usuario:', userData.nombre);
    setUser(userData);
    setToken(userToken);
    
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <SupercasaLogo 
            size="large"
            showText={true}
            showSlogan={false}
            darkMode={false}
            className="mb-6 animate-pulse"
          />
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-lg text-amber-800 font-medium">Cargando Supercasa...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar autenticación
  if (!user || !token) {
    return <AuthContainer onAuth={handleLogin} />;
  }

  // Si hay usuario, mostrar la tienda
  return <Store user={user} token={token} onLogout={handleLogout} />;
}

// Componente de autenticación
function AuthContainer({ onAuth }) {
  const [showLogin, setShowLogin] = useState(true);

  return showLogin ? (
    <LoginForm 
      onLogin={onAuth}
      onSwitchToRegister={() => setShowLogin(false)}
    />
  ) : (
    <RegisterForm 
      onRegister={onAuth}
      onSwitchToLogin={() => setShowLogin(true)}
    />
  );
}

// ✅ COMPONENTE DE LOGIN CORREGIDO - SIN POLÍTICA DE DATOS
function LoginForm({ onLogin, onSwitchToRegister }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    cedula: '',
    telefono: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCartInfo, setShowCartInfo] = useState(false);

  // Verificar si hay carrito temporal al cargar
  useEffect(() => {
    if (hasTemporaryCart()) {
      setShowCartInfo(true);
      toast('💡 Tiene productos guardados. Inicie sesión para recuperar su carrito.', {
        duration: 6000,
        style: {
          background: '#fbbf24',
          color: '#92400e'
        }
      });
    }
  }, []);

  const handleSubmit = async () => {
    if (!formData.email || !formData.cedula || !formData.telefono) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      const loadingToast = toast.loading('Verificando datos...');

      const response = await api.post('/auth/login', {
        email: formData.email.trim().toLowerCase(),
        cedula: formData.cedula.trim(),
        telefono: formData.telefono.trim()
      }, navigate);

      toast.dismiss(loadingToast);

      if (response.token && response.user) {
        // Restaurar carrito si existe
        const carritoRestaurado = restoreCartAfterLogin();
        
        // Mensaje de bienvenida diferenciado
        if (carritoRestaurado) {
          // Ya se muestra el mensaje en restoreCartAfterLogin()
        } else {
          toast.success(`¡Bienvenido a Supercasa, ${response.user.nombre}! 🏗️`, {
            duration: 3000,
            icon: '👋'
          });
        }

        onLogin(response.user, response.token);
      } else {
        throw new Error('Respuesta del servidor incompleta');
      }

    } catch (error) {
      console.error('Error en login:', error);
      
      if (error.message.includes('servidor')) {
        toast.error('Conectando con el servidor... Intente nuevamente en unos segundos.');
      } else if (error.message.includes('datos no coinciden') || error.message.includes('usuario no encontrado')) {
        toast.error('Los datos ingresados no coinciden con ningún usuario registrado');
      } else {
        toast.error(error.message || 'Error al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-amber-200">
        <div className="text-center mb-8">
          <SupercasaLogo 
            size="large"
            showText={true}
            showSlogan={true}
            darkMode={false}
            className="justify-center mb-4"
          />
        </div>

        {/* Alerta de carrito temporal */}
        {showCartInfo && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-amber-600 mr-2">🛒</span>
              <p className="text-sm text-amber-800">
                <strong>Carrito recuperable:</strong> Sus productos se restaurarán después del login.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="tu@email.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Cédula</label>
            <input
              type="text"
              value={formData.cedula}
              onChange={(e) => setFormData({...formData, cedula: e.target.value})}
              className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="12345678"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Teléfono</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="3001234567"
              disabled={isLoading}
            />
          </div>

          {/* ✅ UN SOLO BOTÓN CORRECTO */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-medium text-white transition-all ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verificando datos...
              </div>
            ) : (
              '🏗️ Ingresar a Supercasa'
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-amber-600 hover:text-amber-700 font-medium"
              disabled={isLoading}
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ✅ COMPONENTE DE REGISTRO CORREGIDO CON POLÍTICA DE DATOS
function RegisterForm({ onRegister, onSwitchToLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    cedula: '',
    telefono: '',
    telefono_alternativo: '',
    torre: '',
    piso: '',
    apartamento: '',
    notas_entrega: '',
    // ✅ CAMPOS PARA POLÍTICA DE DATOS
    privacy_accepted: false,
    marketing_accepted: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // ✅ HANDLER PARA AUTORIZACIONES
  const handleAuthChange = (authData) => {
    setFormData(prev => ({
      ...prev,
      privacy_accepted: authData.main,
      marketing_accepted: authData.marketing
    }));
  };

  const handleSubmit = async () => {
    // ✅ VALIDACIÓN ACTUALIZADA
    if (!formData.nombre || !formData.email || !formData.cedula || !formData.telefono || !formData.torre || !formData.piso || !formData.apartamento || !formData.privacy_accepted) {
      if (!formData.privacy_accepted) {
        toast.error('Debes aceptar la política de tratamiento de datos para registrarte');
        return;
      }
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!['1', '2', '3', '4', '5'].includes(formData.torre)) {
      toast.error('Selecciona una torre válida');
      return;
    }

    if (formData.piso < 1 || formData.piso > 30) {
      toast.error('El piso debe estar entre 1 y 30');
      return;
    }

    setIsLoading(true);

    try {
      const loadingToast = toast.loading('Registrando usuario...');

      const response = await api.post('/auth/register', formData, navigate);

      toast.dismiss(loadingToast);

      if (response.token && response.user) {
        toast.success(`¡Bienvenido a Supercasa, ${response.user.nombre}! 🏗️`, {
          duration: 4000,
          icon: '🎉'
        });
        onRegister(response.user, response.token);
      } else {
        throw new Error('Respuesta del servidor incompleta');
      }

    } catch (error) {
      console.error('Error en registro:', error);
      
      if (error.message.includes('email ya existe')) {
        toast.error('Este email ya está registrado. Intenta con otro o inicia sesión.');
      } else if (error.message.includes('cedula ya existe')) {
        toast.error('Esta cédula ya está registrada. Intenta iniciar sesión.');
      } else if (error.message.includes('servidor')) {
        toast.error('Conectando con el servidor... Intente nuevamente en unos segundos.');
      } else {
        toast.error(error.message || 'Error al registrarse');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-amber-200">
        <div className="text-center mb-6">
          <SupercasaLogo 
            size="large"
            showText={true}
            showSlogan={false}
            darkMode={false}
            className="justify-center mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registro Supercasa</h2>
          <p className="text-gray-600">Únete a nuestro conjunto residencial</p>
        </div>

        <div className="space-y-4">
          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Tu nombre completo"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="tu@email.com"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Cédula */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Cédula *
            </label>
            <input
              type="text"
              value={formData.cedula}
              onChange={(e) => setFormData({...formData, cedula: e.target.value})}
              className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="12345678"
              disabled={isLoading}
            />
          </div>

          {/* Teléfonos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Teléfono Principal *
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="3001234567"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Teléfono Alternativo
              </label>
              <input
                type="tel"
                value={formData.telefono_alternativo}
                onChange={(e) => setFormData({...formData, telefono_alternativo: e.target.value})}
                className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Opcional"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Información de Ubicación con branding */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
            <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
              🏗️ Ubicación en las 5 Torres
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Torre *
                </label>
                <select
                  value={formData.torre}
                  onChange={(e) => setFormData({...formData, torre: e.target.value})}
                  className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Selecciona torre</option>
                  <option value="1">🏗️ Torre 1</option>
                  <option value="2">🏗️ Torre 2</option>
                  <option value="3">🏗️ Torre 3</option>
                  <option value="4">🏗️ Torre 4</option>
                  <option value="5">🏗️ Torre 5</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Piso * (1-30)
                </label>
                <input
                  type="number"
                  value={formData.piso}
                  onChange={(e) => setFormData({...formData, piso: e.target.value})}
                  className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ej: 5"
                  min="1"
                  max="30"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Apartamento *
                </label>
                <input
                  type="text"
                  value={formData.apartamento}
                  onChange={(e) => setFormData({...formData, apartamento: e.target.value})}
                  className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ej: 501, A, B"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Notas de entrega */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Instrucciones de Entrega (Opcional)
            </label>
            <textarea
              value={formData.notas_entrega}
              onChange={(e) => setFormData({...formData, notas_entrega: e.target.value})}
              className="w-full px-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              rows="3"
              placeholder="Ej: Llamar al celular antes de subir, timbre no funciona, etc."
              disabled={isLoading}
            />
          </div>

          {/* ✅ COMPONENTE DE AUTORIZACIÓN DE DATOS */}
          <AutorizacionDatos
            darkMode={false}
            onAuthChange={handleAuthChange}
            showModal={showPrivacyModal}
            setShowModal={setShowPrivacyModal}
            isLoading={isLoading}
          />

          {/* Botón de registro con branding */}
          <button
            onClick={handleSubmit}
            disabled={!formData.privacy_accepted || isLoading}
            className={`w-full py-3 rounded-xl font-medium text-white transition-all ${
              formData.privacy_accepted && !isLoading
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Registrando...
              </div>
            ) : !formData.privacy_accepted ? (
              '⚠️ Acepta la política de datos para continuar'
            ) : (
              '🏗️ Registrarse en Supercasa'
            )}
          </button>
        </div>

        {/* Link para cambiar a login */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-amber-600 hover:text-amber-700 font-medium"
              disabled={isLoading}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ✅ COMPONENTE PRINCIPAL DE LA TIENDA CON BRANDING COMPLETO
function Store({ user, token, onLogout }) {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [paquetes, setPaquetes] = useState([]);
const [showPaquetes, setShowPaquetes] = useState(false);
const [paquetesLoading, setPaquetesLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showWompiPayment, setShowWompiPayment] = useState(false);
 
const [costoEnvio, setCostoEnvio] = useState(0);
const [mensajeEnvio, setMensajeEnvio] = useState('');
const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('efectivo');
const [calculandoEnvio, setCalculandoEnvio] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [cashPaymentModal, setCashPaymentModal] = useState(false);
  const [isProcessingCash, setIsProcessingCash] = useState(false);
  const [descuentoAplicado, setDescuentoAplicado] = useState(null);
  const [canjeAplicado, setCanjeAplicado] = useState(null);
  const [puntosUsuario, setPuntosUsuario] = useState(0);
const [nivelUsuario, setNivelUsuario] = useState('BRONCE');
const [multiplicadorPuntos, setMultiplicadorPuntos] = useState(1.0);
const [showCanjesModal, setShowCanjesModal] = useState(false);
const [recompensasDisponibles, setRecompensasDisponibles] = useState([]);
const [historialPuntos, setHistorialPuntos] = useState([]);
const [puntosGanadosCompra, setPuntosGanadosCompra] = useState(0);
  // 🌙 MODO OSCURO
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Guardar preferencia de modo oscuro
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  
  // Datos de entrega específicos para conjunto residencial
  const [deliveryData, setDeliveryData] = useState({
    torre_entrega: user?.torre || '1',
    piso_entrega: user?.piso || '',
    apartamento_entrega: user?.apartamento || '',
    instrucciones_entrega: user?.notas_entrega || '',
    telefono_contacto: user?.telefono || '',
    nombre: user?.nombre || '',
    email: user?.email || ''
  });

  // Actualizar deliveryData cuando user cambie
  useEffect(() => {
    if (user) {
      setDeliveryData({
        torre_entrega: user.torre || '1',
        piso_entrega: user.piso || '',
        apartamento_entrega: user.apartamento || '',
        instrucciones_entrega: user.notas_entrega || '',
        telefono_contacto: user.telefono || '',
        nombre: user.nombre || '',
        email: user.email || ''
      });
    }
  }, [user]);

// Cargar productos y paquetes
useEffect(() => {
  obtenerProductos();
  obtenerPaquetes();
}, []);

  // Restaurar carrito desde localStorage al cargar
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      try {
        setCarrito(JSON.parse(carritoGuardado));
      } catch (error) {
        console.error('Error parsing carrito:', error);
        localStorage.removeItem('carrito');
      }
    }

    // Restaurar carrito después de login si existe
    const carritoRestaurado = restoreCartAfterLogin();
    if (carritoRestaurado) {
      setCarrito(carritoRestaurado);
    }
  }, []);

  // Verificar pedidos recientes al regresar de pagos PSE
  useEffect(() => {
    const verificarPedidoReciente = async () => {
      const carritoActual = JSON.parse(localStorage.getItem('carrito') || '[]');
      
      if (carritoActual.length > 0) {
        console.log('🔍 Verificando pedidos recientes al cargar Store...');
        
        try {
          const response = await fetch(`${API_URL}/api/verificar-pedido-reciente`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data.found && data.payment_status === 'APPROVED') {
              console.log('🎉 ¡PEDIDO RECIENTE DETECTADO AL REGRESAR!', data);
              
              setCarrito([]);
              localStorage.removeItem('carrito');
              
              toast.success(`🎉 ¡Tu pago fue confirmado! Pedido ${data.pedidoId} creado exitosamente. Entrega en máximo 20 minutos.`, {
                duration: 10000,
                style: {
                  background: '#10B981',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '16px',
                  fontSize: '16px'
                }
              });
              
              setTimeout(() => {
                const userConfirm = window.confirm(
                  `✅ ¡PEDIDO CONFIRMADO!\n\n` +
                  `Número: ${data.pedidoId}\n` +
                  `Total: $${data.total.toLocaleString()}\n` +
                  `Entrega: Máximo 20 minutos\n\n` +
                  `¿Deseas ver tu historial de pedidos?`
                );
                
                if (userConfirm) {
                  navigate('/historial');
                }
              }, 3000);
            }
          }
        } catch (error) {
          console.log('⚠️ Error verificando pedido reciente:', error);
        }
      }
    };

    if (token) {
      verificarPedidoReciente();
    }
  }, [token, navigate]);

  // Cargar puntos y recompensas al iniciar
useEffect(() => {
  if (user && token) {
    cargarPuntosUsuario();
    cargarRecompensas();
  }
}, [user, token]);


// Debug: Verificar carga de puntos
useEffect(() => {
  console.log('💎 Estado de puntos:', {
    puntos: puntosUsuario,
    nivel: nivelUsuario,
    multiplicador: multiplicadorPuntos,
    puntosAGanar: puntosGanadosCompra
  });
}, [puntosUsuario, nivelUsuario, multiplicadorPuntos, puntosGanadosCompra]);
  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  // Verificar respuesta de endpoints
useEffect(() => {
  if (user && token) {
    console.log('🔍 Verificando endpoints de puntos...');
    console.log('Usuario:', user.email);
    console.log('Token existe:', !!token);
    
    // Si no se cargan puntos después de 3 segundos, avisar
    setTimeout(() => {
      if (puntosUsuario === 0 && nivelUsuario === 'BRONCE') {
        console.warn('⚠️ Los puntos no se han cargado. Verificar endpoints:');
        console.warn('- GET /api/puntos/usuario');
        console.warn('- Verificar que el token se envía correctamente');
        console.warn('- Revisar la consola Network para ver si hay errores 401/403');
      }
    }, 3000);
  }
}, [user, token]);

  const obtenerProductos = async () => {
    setIsLoading(true);
    try {
      const productos = await api.get('/productos-con-descuentos', navigate);
      console.log("Productos cargados desde la base de datos:", productos);
      setProductos(productos);
    } catch (error) {
      toast.error('Error al cargar productos: ' + error.message);
      setProductos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const obtenerPaquetes = async () => {
  setPaquetesLoading(true);
  try {
    const response = await fetch(`${API_URL}/paquetes`);
    const data = await response.json();
    if (data.success) {
      setPaquetes(data.paquetes);
    }
  } catch (error) {
    console.error('Error cargando paquetes:', error);
    toast.error('Error cargando paquetes');
  } finally {
    setPaquetesLoading(false);
  }
};

const calcularPuntosCompra = () => {
  // Calcular el subtotal actual directamente del carrito
  const subtotalActual = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  
  // Solo calcular puntos si el subtotal es >= $15,000 (monto mínimo)
  if (subtotalActual < 15000) {
    return 0;
  }
  
  // Calcular puntos base: 10 puntos por cada $1,000
  const puntosPorMil = 10;
  const puntosBase = Math.floor(subtotalActual / 1000) * puntosPorMil;
  
  // Aplicar multiplicador por nivel (si existe)
  const puntosConMultiplicador = Math.floor(puntosBase * multiplicadorPuntos);
  
  // Bonus por compra grande (>= $50,000)
  let bonusCompraGrande = 0;
  if (subtotalActual >= 50000) {
    bonusCompraGrande = 50; // 50 puntos extra
  }
  
  // Bonus adicional por nivel
  let bonusNivel = 0;
  if (nivelUsuario === 'PLATA' && subtotalActual >= 30000) {
    bonusNivel = 20; // 20 puntos extra para PLATA
  } else if (nivelUsuario === 'ORO' && subtotalActual >= 25000) {
    bonusNivel = 30; // 30 puntos extra para ORO
  }
  
  // Calcular total de puntos
  const puntosTotales = puntosConMultiplicador + bonusCompraGrande + bonusNivel;
  
  // Log para debug
  console.log(`💎 Cálculo de puntos:`, {
    subtotal: subtotalActual,
    puntosBase: puntosBase,
    multiplicador: multiplicadorPuntos,
    puntosConMultiplicador: puntosConMultiplicador,
    nivel: nivelUsuario,
    bonusCompraGrande: bonusCompraGrande,
    bonusNivel: bonusNivel,
    puntosTotales: puntosTotales
  });
  
  return puntosTotales;
};


// ========== FUNCIONES DE PUNTOS ==========
// Cargar puntos del usuario
const cargarPuntosUsuario = async () => {
  try {
    const response = await fetch(`${API_URL}/api/puntos/usuario`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      setPuntosUsuario(data.puntos_disponibles || 0);
      setNivelUsuario(data.nivel || 'BRONCE');
      setMultiplicadorPuntos(data.multiplicador || 1.0);
    }
  } catch (error) {
    console.error('Error cargando puntos:', error);
  }
};

// Registrar puntos ganados
const registrarPuntos = async (pedidoId, puntos) => {
  try {
    await fetch(`${API_URL}/api/puntos/registrar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        pedido_id: pedidoId,
        puntos: puntos,
        tipo: 'COMPRA'
      })
    });
  } catch (error) {
    console.error('Error registrando puntos:', error);
  }
};

// Cargar recompensas disponibles
const cargarRecompensas = async () => {
  try {
    const response = await fetch(`${API_URL}/api/recompensas/disponibles`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      setRecompensasDisponibles(data);
    }
  } catch (error) {
    console.error('Error cargando recompensas:', error);
  }
};

// Manejar canje de recompensa
const handleCanjearRecompensa = async (recompensa) => {
  try {
    const response = await fetch(`${API_URL}/api/canjes/crear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        recompensa_id: recompensa.id,
        puntos_usados: recompensa.puntos_requeridos
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      setCanjeAplicado(data.canje);
      setPuntosUsuario(prev => prev - recompensa.puntos_requeridos);
      toast.success(`🎉 Canje exitoso: ${recompensa.nombre}`);
      setShowCanjesModal(false);
    }
  } catch (error) {
    toast.error('Error al canjear recompensa');
  }
};

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const matchesCategory = categoriaSeleccionada ? producto.categoria === categoriaSeleccionada : true;
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categorias = [...new Set(productos.map(producto => producto.categoria))];

 const agregarAlCarrito = (producto) => {
  // 🔄 Calcular precio final con descuento (si aplica)
  const tieneDescuento = producto.descuento_activo && producto.descuento_porcentaje > 0;
  const precioFinal = tieneDescuento
    ? Math.round(producto.precio * (100 - producto.descuento_porcentaje) / 100)
    : producto.precio;

  // 🛒 Preparar producto para el carrito con info de descuentos
  const productoParaCarrito = {
    ...producto,
    precio: precioFinal, // Precio ya con descuento aplicado
    // 🆕 Preservar información de descuentos
    descuento_activo: producto.descuento_activo || false,
    descuento_porcentaje: producto.descuento_porcentaje || 0,
    precio_original: producto.precio // Para referencia
  };

  const productoExistente = carrito.find(item => item.id === producto.id);
  
  if (productoExistente) {
    setCarrito(carrito.map(item =>
      item.id === producto.id
        ? { ...item, cantidad: item.cantidad + 1 }
        : item
    ));
  } else {
    setCarrito([...carrito, { ...productoParaCarrito, cantidad: 1 }]);
  }
  
  toast.success(`🏗️ ${producto.nombre} agregado al carrito`, {
    duration: 2000,
    icon: '🛒'
  });

  setTimeout(() => {
  const puntos = calcularPuntosCompra();
  setPuntosGanadosCompra(puntos);
}, 100);
};

const agregarPaqueteAlCarrito = (paquete) => {
  // Verificar stock de paquetes disponibles
  if (paquete.stock_paquetes_disponibles <= 0) {
    toast.error('Este paquete no está disponible por stock insuficiente');
    return;
  }

  // Preparar paquete para el carrito
  const paqueteParaCarrito = {
    id: `paquete_${paquete.id}`, // ID único para diferenciar de productos
    tipo: 'paquete',
    paquete_id: paquete.id,
    nombre: paquete.nombre,
    descripcion: paquete.descripcion,
    precio: paquete.precio_paquete,
    precio_original: paquete.precio_individual_total,
    ahorro_monto: paquete.ahorro_monto,
    ahorro_porcentaje: paquete.ahorro_porcentaje,
    productos_incluidos: paquete.productos_incluidos,
    cantidad: 1,
    categoria: paquete.categoria,
    imagen: paquete.imagen
  };

  const paqueteExistente = carrito.find(item => item.id === paqueteParaCarrito.id);

  if (paqueteExistente) {
    // Verificar si puede agregar más
    if (paqueteExistente.cantidad >= paquete.stock_paquetes_disponibles) {
      toast.error(`Solo hay ${paquete.stock_paquetes_disponibles} paquetes disponibles`);
      return;
    }

    setCarrito(carrito.map(item =>
      item.id === paqueteParaCarrito.id
        ? { ...item, cantidad: item.cantidad + 1 }
        : item
    ));
  } else {
    setCarrito([...carrito, paqueteParaCarrito]);
  }

  toast.success(`🎁 ${paquete.nombre} agregado al carrito`, {
    duration: 2000,
    icon: '🛒'
  });
};

const eliminarDelCarrito = (itemId) => {
  const itemExistente = carrito.find(item => item.id === itemId);

  if (itemExistente.cantidad > 1) {
    setCarrito(carrito.map(item =>
      item.id === itemId
        ? { ...item, cantidad: item.cantidad - 1 }
        : item
    ));
  } else {
    setCarrito(carrito.filter(item => item.id !== itemId));
  }
  // Forzar recálculo inmediato de puntos
setTimeout(() => {
  const puntos = calcularPuntosCompra();
  setPuntosGanadosCompra(puntos);
}, 100);
};

  const finalizarCompra = async () => {
    if (carrito.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    setShowCheckout(true);
  };

  const procederAlPago = () => {
    if (!deliveryData.torre_entrega) {
      toast.error('Por favor selecciona la torre de entrega');
      return;
    }
    if (!deliveryData.piso_entrega) {
      toast.error('Por favor ingresa el piso de entrega');
      return;
    }
    if (!deliveryData.apartamento_entrega) {
      toast.error('Por favor ingresa el apartamento de entrega');
      return;
    }

    setShowCheckout(false);
    setShowWompiPayment(true);
  };

const handlePaymentSuccess = async (paymentData) => {
  console.log('💳 PAGO EXITOSO CONFIRMADO:', paymentData);
  const puntosGanados = calcularPuntosCompra();
  // ✅ MANEJAR TANTO TARJETAS COMO OTROS MÉTODOS
  if (paymentData.success && (paymentData.pedidoId || paymentData.transactionId)) {
    await registrarPuntos(paymentData.pedidoId, puntosGanados);
    toast.success(
      `🎉 ¡Pago aprobado! Ganaste ${puntosGanados} puntos 💎`, 
      { duration: 8000 }
    );
    setPuntosUsuario(prev => prev + puntosGanados);
    console.log('✅ ¡Pago y pedido exitosos!');
    
    // ✅ MENSAJE ESPECÍFICO PARA TARJETAS PENDING
    if (paymentData.metodoPago === 'CARD' && paymentData.status === 'PENDING') {
      toast.success('💳 ¡Pago con tarjeta procesado exitosamente! El pedido se confirmará automáticamente.', {
        duration: 6000,
        icon: '🎉'
      });
    } else {
      toast.success('🏗️ ¡Pago aprobado y pedido creado exitosamente!', {
        duration: 6000,
        icon: '🎉'
      });
    }

    setCarrito([]);
    localStorage.removeItem('carrito');
    setShowWompiPayment(false);
    setShowCart(false);

    console.log('🏆 PROCESO COMPLETADO - Pago exitoso procesado completamente');

  } else {
    console.log('❌ Respuesta inesperada del backend:', paymentData);
    toast.error('Error: El pago no fue confirmado correctamente.', {
      duration: 8000
    });
  }
};

  const handlePaymentError = (error) => {
    console.error('💳 Error en el pago:', error);
    setShowWompiPayment(false);
    
    if (error.status === 'DECLINED') {
      toast.error('Pago rechazado. Puede intentar con otro método de pago.', {
        duration: 5000
      });
    } else {
      toast.error('Error procesando el pago. Intente nuevamente.', {
        duration: 5000
      });
    }
  };

  const cancelarPago = () => {
    setShowWompiPayment(false);
    setShowCheckout(true);
  };

// Reemplaza tu componente PaqueteCard actual en Store.jsx con este código mejorado:

const PaqueteCard = ({ paquete, onAgregar }) => {
  const stockDisponible = paquete.stock_paquetes_disponibles > 0;
  
  return (
    <div className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
      stockDisponible ? 'border-amber-200' : 'border-gray-200 opacity-60'
    }`}>
      
      {/* ✅ HEADER SEPARADO - Sin badge montado sobre título */}
      <div className="p-6">
        {/* Header con badges separados */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            🎁 PAQUETE
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ¡Ahorras ${Number(paquete.ahorro_monto || 0).toLocaleString()}!
          </span>
        </div>

        {/* ✅ NOMBRE DEL PAQUETE - Ya no montado */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
          {paquete.nombre}
        </h3>
        
        {paquete.descripcion && (
          <p className="text-sm text-gray-600 mb-4">
            {paquete.descripcion}
          </p>
        )}

        {/* ✅ PRECIOS CON MEJOR LAYOUT */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-500 line-through">
              Precio individual: ${Number(paquete.precio_individual_total || 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600">Precio paquete:</span>
              <p className="text-2xl font-bold text-amber-600">
                ${Number(paquete.precio_paquete || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm text-green-600 font-medium">Tu ahorro:</span>
              <p className="text-lg font-bold text-green-600">
                {Number(paquete.ahorro_porcentaje || 0).toFixed(1)}% OFF
              </p>
            </div>
          </div>
        </div>

        {/* ✅ PRODUCTOS INCLUIDOS CON IMÁGENES REALES PEQUEÑAS ABAJO */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">🛒 Incluye:</p>
          
          {/* Grid de imágenes pequeñas - USANDO IMÁGENES REALES */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {paquete.productos_incluidos?.slice(0, 4).map((producto, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center border-2 border-amber-200 overflow-hidden">
                  {producto.imagen ? (
                    <img 
                      src={producto.imagen} 
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-amber-600 text-lg">🛒</span>
                  )}
                </div>
                <span className="text-xs text-gray-600 mt-1 text-center leading-tight">
                  {producto.nombre}
                </span>
                {producto.cantidad > 1 && (
                  <span className="text-xs bg-amber-500 text-white rounded-full px-1">
                    x{producto.cantidad}
                  </span>
                )}
              </div>
            ))}
            
            {/* Mostrar +X si hay más productos */}
            {paquete.productos_incluidos?.length > 4 && (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center border-2 border-amber-300">
                  <span className="text-amber-600 text-xs font-bold">
                    +{paquete.productos_incluidos.length - 4}
                  </span>
                </div>
                <span className="text-xs text-gray-600 mt-1 text-center">
                  más
                </span>
              </div>
            )}
          </div>
          
          {/* Lista detallada compacta */}
          <div className="space-y-1 max-h-16 overflow-y-auto bg-gray-50 rounded-lg p-2">
            {paquete.productos_incluidos?.map((producto, index) => (
              <div key={index} className="flex justify-between text-xs text-gray-600">
                <span>• {producto.nombre}</span>
                <span>{producto.cantidad > 1 ? `x${producto.cantidad}` : ''}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ STOCK Y BOTÓN */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Stock disponible:</span>
            <span className={`font-medium ${stockDisponible ? 'text-green-600' : 'text-red-600'}`}>
              {paquete.stock_paquetes_disponibles || 0} paquetes
            </span>
          </div>

          <button
            onClick={() => onAgregar(paquete)}
            disabled={!stockDisponible}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-3 rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold"
          >
            {stockDisponible ? '🛒 Agregar Paquete' : '❌ Sin Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Calcular descuento del código promocional

// Cálculo de totales
const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
const descuentoMonto = descuentoAplicado ? 
  (descuentoAplicado.tipo === 'porcentaje' 
    ? Math.round(subtotal * descuentoAplicado.valor / 100)
    : descuentoAplicado.valor) 
  : 0;
const descuentoCanje = canjeAplicado ? canjeAplicado.valor_descuento : 0;
const total = subtotal - descuentoMonto - descuentoCanje;


// 🎯 RECALCULAR PUNTOS CUANDO CAMBIA EL CARRITO
useEffect(() => {
  const puntos = calcularPuntosCompra();
  setPuntosGanadosCompra(puntos);
  console.log('📊 Puntos recalculados:', puntos);
}, [carrito, multiplicadorPuntos]); // Solo depende del carrito y multiplicador

// ===================================
// 🚚 FUNCIÓN CALCULAR ENVÍO
// ===================================
const calcularEnvio = async (metodo) => {
  if (subtotal <= 0) {
    setCostoEnvio(0);
    setMensajeEnvio('');
    return null;
  }

  setCalculandoEnvio(true);
  
  try {
    console.log(`🚚 Calculando envío - Subtotal: $${subtotal}, Método: ${metodo}`);
    
    const response = await fetch(`${API_URL}/api/calcular-envio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        subtotal: subtotal,
        metodoPago: metodo
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      setCostoEnvio(data.costoEnvio);
      setMensajeEnvio(data.mensaje);
      setMetodoPagoSeleccionado(metodo);
      
      console.log(`✅ Envío calculado: $${data.costoEnvio} - ${data.mensaje}`);
      return data;
    } else {
      toast.error(data.error || 'Error calculando envío');
      setCostoEnvio(0);
      setMensajeEnvio('');
      return null;
    }
  } catch (error) {
    console.error('❌ Error calculando envío:', error);
    toast.error('Error de conexión calculando envío');
    setCostoEnvio(0);
    setMensajeEnvio('');
    return null;
  } finally {
    setCalculandoEnvio(false);
  }
};



// ✅ TOTAL FINAL CON ENVÍO
const totalConEnvio = total + costoEnvio;

// ===================================
// 🔄 CALCULAR ENVÍO AUTOMÁTICAMENTE
// ===================================
useEffect(() => {
  const calcularEnvioAutomatico = async () => {
    if (subtotal >= 5000 && metodoPagoSeleccionado) {
      await calcularEnvio(metodoPagoSeleccionado);
    } else if (subtotal < 5000) {
      setCostoEnvio(0);
      setMensajeEnvio('');
    }
  };
  
  calcularEnvioAutomatico();
}, [subtotal, metodoPagoSeleccionado]); // Se ejecuta cuando cambia el subtotal o método



// ✅ TOTAL FINAL CON ENVÍO

  const processCashPayment = async () => {
    setIsProcessingCash(true);
    
    try {
      console.log('💵 PROCESANDO PAGO EN EFECTIVO');
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Debes iniciar sesión para hacer un pedido');
        return;
      }

      console.log('🔍 deliveryData:', deliveryData);
      console.log('🔍 user completo:', user);
      
      const finalDeliveryData = {
        torre_entrega: deliveryData.torre_entrega || user.torre || '1',
        piso_entrega: deliveryData.piso_entrega || user.piso || '1',
        apartamento_entrega: deliveryData.apartamento_entrega || user.apartamento || '101',
        telefono_contacto: deliveryData.telefono_contacto || user.telefono || '3000000000',
        email: deliveryData.email || user.email,
        nombre: deliveryData.nombre || user.nombre,
        instrucciones_entrega: deliveryData.instrucciones_entrega || user.notas_entrega || ''
      };

      console.log('🏠 Datos de entrega final:', finalDeliveryData);
      
      if (!finalDeliveryData.torre_entrega || !['1', '2', '3', '4', '5'].includes(String(finalDeliveryData.torre_entrega))) {
        console.error('❌ Torre inválida:', finalDeliveryData.torre_entrega);
        toast.error('Torre inválida. Debe ser 1, 2, 3, 4 o 5');
        return;
      }
      
      const pisoNum = parseInt(finalDeliveryData.piso_entrega);
      if (!pisoNum || pisoNum < 1 || pisoNum > 30) {
        console.error('❌ Piso inválido:', finalDeliveryData.piso_entrega, 'Parseado:', pisoNum);
        toast.error('Piso inválido. Debe estar entre 1 y 30');
        return;
      }
      
      if (!finalDeliveryData.apartamento_entrega || String(finalDeliveryData.apartamento_entrega).trim() === '') {
        console.error('❌ Apartamento inválido:', finalDeliveryData.apartamento_entrega);
        toast.error('El apartamento es obligatorio');
        return;
      }

      console.log('✅ Validaciones pasadas - Torre:', finalDeliveryData.torre_entrega, 'Piso:', pisoNum, 'Apt:', finalDeliveryData.apartamento_entrega);

      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const orderNumber = Math.floor(Math.random() * 9000) + 1000;
      const reference = `SC-CASH-${timestamp}-${random}-${orderNumber}`;
      
      const orderData = {
  cliente_email: finalDeliveryData.email,
  telefono_contacto: finalDeliveryData.telefono_contacto,
  torre_entrega: String(finalDeliveryData.torre_entrega),
  piso_entrega: String(finalDeliveryData.piso_entrega),
  apartamento_entrega: String(finalDeliveryData.apartamento_entrega).trim(),
  instrucciones_entrega: finalDeliveryData.instrucciones_entrega || '',
  notas_entrega: finalDeliveryData.instrucciones_entrega || '',
  productos: carrito.filter(item => item.tipo !== 'paquete').map(item => ({
    id: item.id,
    nombre: item.nombre,
    precio: item.precio,
    cantidad: item.cantidad
  })),
  paquetes: carrito.filter(item => item.tipo === 'paquete').map(item => ({
    id: item.paquete_id,
    nombre: item.nombre,
    precio: item.precio,
    cantidad: item.cantidad
  })),
  total: carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
  metodo_pago: 'EFECTIVO',
  estado_pago: 'PENDIENTE_EFECTIVO',
  transaccion_id: `CASH-${reference}`,
  referencia_pago: reference,
  codigo_promocional: descuentoAplicado?.codigo || null,
  codigo_canje: canjeAplicado?.codigo || null  // 🎯 AGREGAR ESTA LÍNEA
};

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('🎉 ¡PEDIDO EN EFECTIVO CREADO!', result);
        // Calcular y registrar puntos para pago en efectivo
const puntosGanados = calcularPuntosCompra();
if (puntosGanados > 0 && result.pedidoId) {
  await registrarPuntos(result.pedidoId, puntosGanados);
  setPuntosUsuario(prev => prev + puntosGanados);
  
  toast.success(`🏗️ ¡Pedido creado! Ganaste ${puntosGanados} puntos 💎`, {
    duration: 8000,
    icon: '🎉'
  });
} else {
  toast.success(`🏗️ ¡Pedido creado exitosamente! 💵 Pago en efectivo al recibir.`, {
    duration: 8000,
    icon: '🎉'
  });
}
        
        
        
        setCarrito([]);
        localStorage.removeItem('carrito');
        setCashPaymentModal(false);
        setShowCart(false);
        
      } else {
        console.error('❌ Error del backend:', result);
        throw new Error(result.message || result.error || `Error ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      console.error('❌ Error en efectivo:', error);
      
      if (error.message && (
          error.message.includes('sesión ha expirado') || 
          error.message.includes('inicie sesión') ||
          error.message.includes('Token inválido') ||
          error.message.includes('LOGIN_REQUIRED') ||
          error.message.includes('SESSION_EXPIRED')
      )) {
        toast.error('Su sesión ha expirado. Por favor inicie sesión nuevamente.', {
          duration: 4000,
          icon: '🔑',
          style: {
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #f59e0b'
          }
        });
        
        setCashPaymentModal(false);
        setShowCart(false);
        
        setTimeout(() => {
          onLogout();
        }, 2000);
        return;
      }
      
      if (error.message && error.message.includes('Stock insuficiente')) {
        toast.error(`❌ ${error.message}`, {
          duration: 6000,
          style: {
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca'
          }
        });
      } else if (error.message && error.message.includes('Stock')) {
        toast.error(`📦 Problema de inventario: ${error.message}`, {
          duration: 5000
        });
      } else {
        toast.error(`Error al crear el pedido: ${error.message}`);
      }
    } finally {
      setIsProcessingCash(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100'
      }`}>
        <div className="text-center">
          <SupercasaLogo 
            size="large"
            showText={true}
            showSlogan={false}
            darkMode={darkMode}
            className="mb-6 animate-pulse"
          />
          <div className={`animate-spin rounded-full h-16 w-16 border-b-2 mx-auto ${
            darkMode ? 'border-amber-400' : 'border-amber-600'
          }`}></div>
          <p className={`mt-4 text-lg transition-colors duration-300 ${
            darkMode ? 'text-amber-300' : 'text-amber-800'
          }`}>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100'
    }`}>
      {/* ✅ AGREGAR ESTA LÍNEA */}
    <PromotionalPopup />
      {/* ✅ HEADER CON BRANDING SUPERCASA */}
      <header className={`shadow-lg sticky top-0 z-40 transition-colors duration-300 border-b-2 ${
        darkMode 
          ? 'bg-gray-800 border-amber-600' 
          : 'bg-white border-amber-300'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo Supercasa - Lado izquierdo */}
            <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
              <SupercasaLogo 
                size="medium"
                showText={true}
                showSlogan={false}
                darkMode={darkMode}
                className="transition-all duration-300 hover:scale-105"
              />
              
              {/* Info del usuario - Solo desktop */}
              <div className="hidden sm:block ml-2">
                <p className={`text-xs md:text-sm font-medium transition-colors duration-300 ${
                  darkMode ? 'text-amber-300' : 'text-amber-600'
                }`}>
                  "Tu supermercado en casa, en 20 minutos"
                </p>
                
                <p className={`text-xs md:text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {user?.torre && user?.piso && user?.apartamento ? (
                    `🏗️ Torre ${user.torre}, Piso ${user.piso}, Apt ${user.apartamento}`
                  ) : (
                    `Bienvenido ${user?.nombre || 'Usuario'}`
                  )}
                </p>
              </div>
            </div>
            
            {/* Lado derecho - Controles */}
            <div className="flex items-center space-x-1 md:space-x-3">
              {/* Saludo usuario - Solo desktop */}
              <div className={`hidden lg:flex items-center space-x-2 mr-2 transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <span className="text-sm">Hola, {user?.nombre || 'Usuario'}</span>
              </div>
              
              {/* Banner entrega - Solo desktop grande */}
              <div className={`hidden xl:flex items-center rounded-lg px-3 py-2 border mr-2 transition-colors duration-300 ${
                darkMode 
                  ? 'bg-amber-900 border-amber-700 text-amber-300' 
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm font-medium">🏗️ Entrega rápida 20 min</span>
              </div>
              
              {/* Toggle modo oscuro */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 md:p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${
                  darkMode 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-800 text-yellow-400'
                }`}
                title={darkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {darkMode ? (
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                  </svg>
                )}
              </button>
              
              {/* Panel Admin */}
              {user?.rol === 'admin' && (
                <Link
                  to="/admin"
                  className={`p-2 md:p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${
                    darkMode 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                  title="Panel Admin"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                  </svg>
                </Link>
              )}
              
              {/* Mi Historial */}
              <Link
                to="/historial"
                className={`p-2 md:p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${
                  darkMode 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
                
                title="Mi Historial"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </Link>

              {/* Carrito con branding */}
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-2 md:p-3 rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all flex-shrink-0 shadow-lg"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 md:h-6 md:w-6 flex items-center justify-center animate-pulse">
                    {totalItems}
                  </span>
                )}
              </button>
              
              {/* Logout */}
              <button
                onClick={onLogout}
                className={`p-2 md:p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title="Cerrar sesión"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 01-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner móvil con branding */}
      <div className={`lg:hidden p-3 text-center transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-r from-amber-700 to-yellow-700 text-white' 
          : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
      }`}>
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
          </svg>
          <span className="font-medium text-sm">🏗️ Supercasa - Entrega en máximo 20 minutos</span>
        </div>
      </div>

      {/* Filtros y búsqueda con branding */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`rounded-2xl shadow-lg p-6 mb-6 transition-colors duration-300 border-2 ${
          darkMode 
            ? 'bg-gray-800 border-amber-600' 
            : 'bg-white border-amber-300'
        }`}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Buscar productos en Supercasa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl focus:ring-2 focus:ring-amber-500 transition-colors duration-300 border-2 ${
                  darkMode 
                    ? 'bg-gray-700 border-amber-600 text-white placeholder-gray-400 focus:border-transparent' 
                    : 'bg-white border-amber-200 text-gray-900 focus:border-transparent'
                }`}
              />
            </div>
            
            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              className={`px-4 py-3 rounded-xl focus:ring-2 focus:ring-amber-500 transition-colors duration-300 border-2 ${
                darkMode 
                  ? 'bg-gray-700 border-amber-600 text-white focus:border-transparent' 
                  : 'bg-white border-amber-200 text-gray-900 focus:border-transparent'
              }`}
            >
              <option value="">📦 Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>
        </div>

{/* Toggle Productos/Paquetes */}
<div className="mb-8 flex justify-center">
  <div className="flex bg-gray-100 rounded-xl p-1">
    <button
      onClick={() => setShowPaquetes(false)}
      className={`px-6 py-3 rounded-lg transition-all font-medium ${
        !showPaquetes 
          ? 'bg-white text-amber-600 shadow-md' 
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      🛒 Productos
    </button>
    <button
      onClick={() => setShowPaquetes(true)}
      className={`px-6 py-3 rounded-lg transition-all font-medium ${
        showPaquetes 
          ? 'bg-white text-amber-600 shadow-md' 
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      🎁 Paquetes
    </button>
  </div>
</div>

{/* Contenido condicional - Productos o Paquetes */}
{!showPaquetes ? (
  /* Vista de productos existente */
  <div>
    {console.log('🛒 Mostrando productos. Total productos:', productos.length)}
    {console.log('🔍 Productos filtrados:', productosFiltrados.length)}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {productosFiltrados.map(producto => {
        // Calcular precio con descuento
        const tieneDescuento = producto.descuento_activo && producto.descuento_porcentaje > 0;
        const precioFinal = tieneDescuento
          ? Math.round(producto.precio * (100 - producto.descuento_porcentaje) / 100)
          : producto.precio;

        return (
          <div key={producto.id} className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            {/* Badge de descuento */}
            {tieneDescuento && (
              <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                {producto.descuento_badge_texto || `${producto.descuento_porcentaje}% OFF`}
              </div>
            )}

            {/* Imagen del producto */}
            {producto.imagen && (
              <div className="relative">
                <img 
                  src={producto.imagen} 
                  alt={producto.nombre}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                {producto.nombre}
              </h3>

              {producto.descripcion && (
                <p className={`text-sm mb-3 transition-colors duration-300 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {producto.descripcion}
                </p>
              )}

              {/* Precios */}
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  {tieneDescuento && (
                    <span className="text-gray-500 line-through text-sm">
                      ${producto.precio.toLocaleString()}
                    </span>
                  )}
                  <span className={`text-2xl font-bold transition-colors duration-300 ${
                    tieneDescuento ? 'text-red-600' : (darkMode ? 'text-amber-400' : 'text-amber-600')
                  }`}>
                    ${precioFinal.toLocaleString()}
                  </span>
                </div>
                
                {tieneDescuento && (
                  <div className="text-green-600 font-medium text-sm">
                    Ahorras: ${(producto.precio - precioFinal).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Stock */}
              <div className="mb-4">
                <span className={`text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Stock: {producto.stock || 0}
                </span>
              </div>

              {/* Botón agregar */}
              <button
                onClick={() => agregarAlCarrito(producto)} // ✅ CORRECCIÓN
                disabled={!producto.stock || producto.stock === 0}
                className="w-full mt-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-3 rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-semibold"
              >
                {producto.stock && producto.stock > 0 ? '🗄️ Agregar al carrito' : '❌ Sin stock'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
) : (
  /* Vista de paquetes */
  <div>
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">🎁 Paquetes Promocionales</h2>
      <p className="text-gray-600">Combos especiales con grandes ahorros para tu familia</p>
    </div>

    {paquetesLoading ? (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    ) : paquetes.length === 0 ? (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🎁</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay paquetes disponibles</h3>
        <p className="text-gray-500">Próximamente tendremos ofertas especiales</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paquetes.map(paquete => (
          <PaqueteCard 
            key={paquete.id} 
            paquete={paquete} 
            onAgregar={agregarPaqueteAlCarrito}
          />
        ))}
      </div>
    )}
  </div>
)}

        {productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <div className={`text-6xl mb-4 transition-colors duration-300 ${
              darkMode ? 'text-gray-600' : 'text-amber-400'
            }`}>🔍</div>
            <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>No se encontraron productos</h3>
            <p className={`transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Intenta con otros términos de búsqueda o categorías</p>
          </div>
        )}
      </div>

      {showCart && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 border-2 ${
      darkMode 
        ? 'bg-gray-800 border-amber-600' 
        : 'bg-white border-amber-300'
    }`}>
      
      {/* ✅ HEADER MEJORADO */}
      <div className={`p-6 border-b transition-colors duration-300 ${
        darkMode ? 'border-amber-600' : 'border-amber-300'
      }`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <SupercasaLogo 
              size="small"
              showText={false}
              showSlogan={false}
              darkMode={darkMode}
            />
            <PuntosWidget 
              puntos={puntosUsuario}
  nivel={nivelUsuario}
  onClickCanjes={() => setShowCanjesModal(true)}
  darkMode={darkMode}
            />
            <div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>Tu Carrito Supercasa</h2>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-amber-300' : 'text-amber-600'
              }`}>🏗️ Entrega en máximo 20 minutos</p>
            </div>
          </div>
          <button
            onClick={() => setShowCart(false)}
            className={`p-2 rounded-xl transition-colors duration-300 ${
              darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="p-6">
        {carrito.length === 0 ? (
          
          /* ✅ CARRITO VACÍO MEJORADO */
          <div className="text-center py-12">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${
              darkMode ? 'bg-amber-900' : 'bg-amber-50'
            }`}>
              <span className="text-4xl">🛒</span>
            </div>
            <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>Tu carrito está vacío</h3>
            <p className={`transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>¡Agrega productos y paquetes de Supercasa!</p>
          </div>
          
        ) : (
          <>
            {/* ✅ ITEMS DEL CARRITO CON DISEÑO TIPO CARD */}
            <div className="space-y-4 mb-6">
              {carrito.map(item => (
                <div key={item.id} className={`rounded-2xl p-4 border-2 transition-all duration-300 hover:shadow-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-amber-600' 
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  
                  {/* Header del item con badge */}
                  <div className="flex items-center justify-between mb-3">
                    {item.tipo === 'paquete' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500 text-white">
                        🎁 PAQUETE
                      </span>
                    )}
                    <div className="flex items-center space-x-2 ml-auto">
                      <button
                        onClick={() => eliminarDelCarrito(item.id)}
                        className={`p-1 rounded-lg transition-colors duration-300 ${
                          darkMode 
                            ? 'bg-red-900 text-red-300 hover:bg-red-800' 
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                      </button>
                      <span className={`px-3 py-1 rounded-lg font-medium transition-colors duration-300 ${
                        darkMode ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
                      }`}>{item.cantidad}</span>
                      <button
                        onClick={() => item.tipo === 'paquete' ? agregarPaqueteAlCarrito(item) : agregarAlCarrito(item)}
                        className={`p-1 rounded-lg transition-colors duration-300 ${
                          darkMode 
                            ? 'bg-amber-700 text-amber-300 hover:bg-amber-600' 
                            : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    
                    {/* ✅ IMAGEN MEJORADA - Mosaico para paquetes */}
                    {item.tipo === 'paquete' ? (
                      <div className="w-16 h-16 relative flex-shrink-0">
                        {item.productos_incluidos?.slice(0, 4).map((prod, index) => (
                          <img
                            key={index}
                            src={prod.imagen || `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="#f3f4f6"/><text x="16" y="16" text-anchor="middle" dy=".3em" font-size="10">🛒</text></svg>`)}`}
                            alt={prod.nombre}
                            className={`absolute w-8 h-8 object-cover rounded-lg border-2 border-white shadow-sm ${
                              index === 0 ? 'top-0 left-0' :
                              index === 1 ? 'top-0 right-0' :
                              index === 2 ? 'bottom-0 left-0' : 'bottom-0 right-0'
                            }`}
                          />
                        ))}
                        <div className="absolute inset-0 border-2 border-amber-400 rounded-xl pointer-events-none"></div>
                      </div>
                    ) : (
                      <img 
                        src={item.imagen || `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#f3f4f6"/><text x="32" y="32" text-anchor="middle" dy=".3em" font-size="16">🛒</text></svg>`)}`} 
                        alt={item.nombre} 
                        className="w-16 h-16 object-cover rounded-xl border-2 border-amber-300 flex-shrink-0" 
                      />
                    )}

                    {/* Información del item */}
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg transition-colors duration-300 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>{item.nombre}</h3>
                      
                      {/* Mostrar productos incluidos en paquetes */}
                      {item.tipo === 'paquete' && item.productos_incluidos && (
                        <p className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-amber-300' : 'text-amber-600'
                        }`}>
                          Incluye: {item.productos_incluidos.map(p => p.nombre).join(', ')}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xl font-bold transition-colors duration-300 ${
                          darkMode ? 'text-amber-400' : 'text-amber-600'
                        }`}>
                          ${item.precio.toLocaleString()}
                        </span>
                        <span className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Subtotal: ${(item.precio * item.cantidad).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ CÓDIGO PROMOCIONAL MEJORADO */}
<div className={`rounded-2xl p-4 mb-6 border-2 transition-colors duration-300 ${
  darkMode 
    ? 'bg-gray-700 border-purple-600' 
    : 'bg-purple-50 border-purple-200'
}`}>
  <PromoCodeInput
    carrito={carrito}
    onDescuentoAplicado={setDescuentoAplicado}
    onCanjeAplicado={setCanjeAplicado} // NUEVO
    codigoActual={descuentoAplicado}
    canjeActual={canjeAplicado} // NUEVO
    puntosUsuario={puntosUsuario} // NUEVO
    darkMode={darkMode}
  />
</div>

{/* 🎯 AGREGAR AQUÍ EL COMPONENTE DE CANJE DE PUNTOS */}
<CanjesPuntos 
  total={subtotal}
  onCanjeAplicado={setCanjeAplicado}
  darkMode={darkMode}
/>
           {/* 💎 PUNTOS A GANAR CON ESTA COMPRA - CORREGIDO */}
{subtotal >= 15000 ? (
  <div className={`rounded-xl p-3 mb-4 border-2 ${
    darkMode 
      ? 'bg-purple-900 border-purple-700' 
      : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
  }`}>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-lg">💎</span>
        <span className={`font-medium ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
          Puntos a ganar:
        </span>
        {nivelUsuario !== 'BRONCE' && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            darkMode ? 'bg-purple-800 text-purple-200' : 'bg-purple-200 text-purple-700'
          }`}>
            {nivelUsuario} x{multiplicadorPuntos}
          </span>
        )}
      </div>
      <div className="text-right">
        <span className={`font-bold text-lg ${
          darkMode ? 'text-purple-300' : 'text-purple-600'
        }`}>
          +{puntosGanadosCompra} puntos
        </span>
        {subtotal >= 50000 && (
          <p className="text-xs text-green-600">¡+50 bonus incluidos!</p>
        )}
      </div>
    </div>
    
    {/* Desglose de cálculo CORREGIDO */}
    <div className={`mt-2 pt-2 border-t text-xs ${
      darkMode ? 'border-purple-800 text-purple-400' : 'border-purple-300 text-purple-600'
    }`}>
      <div className="flex justify-between">
        <span>Base ($1000 = 10 pts):</span>
        <span>{Math.floor(subtotal / 1000) * 10} pts</span>
      </div>
      {multiplicadorPuntos > 1 && (
        <div className="flex justify-between">
          <span>Multiplicador {nivelUsuario}:</span>
          <span>x{multiplicadorPuntos}</span>
        </div>
      )}
      {subtotal >= 50000 && (
        <div className="flex justify-between text-green-600">
          <span>Bonus compra grande:</span>
          <span>+50 pts</span>
        </div>
      )}
      <div className="flex justify-between pt-1 border-t font-semibold">
        <span>Total puntos:</span>
        <span className="text-purple-600">+{puntosGanadosCompra}</span>
      </div>
    </div>
  </div>
) : subtotal > 0 ? (
  <div className={`rounded-xl p-3 mb-4 border ${
    darkMode 
      ? 'bg-gray-700 border-gray-600' 
      : 'bg-amber-50 border-amber-200'
  }`}>
    <div className="flex items-center gap-2">
      <span className="text-lg">⚠️</span>
      <div>
        <p className={`text-sm ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>
          Mínimo $15,000 para ganar puntos
        </p>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Te faltan: ${(15000 - subtotal).toLocaleString()}
        </p>
      </div>
    </div>
  </div>
) : null}
              {/* ✅ RESUMEN DE TOTALES CON ENVÍO */}
<div className={`rounded-2xl p-6 mb-6 border-2 transition-colors duration-300 ${
  darkMode
    ? 'bg-gray-700 border-gray-600'
    : 'bg-gray-50 border-gray-200'
}`}>
  <div className="space-y-3">
    {/* Subtotal */}
    <div className="flex justify-between">
      <span className={`font-medium transition-colors duration-300 ${
        darkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>Subtotal productos:</span>
      <span className={`font-bold transition-colors duration-300 ${
        darkMode ? 'text-white' : 'text-gray-800'
      }`}>${subtotal.toLocaleString()}</span>
    </div>

    {/* Descuento código */}
{descuentoMonto > 0 && (
  <div className="flex justify-between text-green-600">
    <span>🎉 Descuento código:</span>
    <span className="font-bold">-${descuentoMonto.toLocaleString()}</span>
  </div>
)}

{/* Descuento por canje */}
{descuentoCanje > 0 && (
  <div className="flex justify-between text-purple-600">
    <span>💎 Descuento por puntos:</span>
    <span className="font-bold">-${descuentoCanje.toLocaleString()}</span>
  </div>
)}

    {/* Envío con línea tachada cuando es gratis */}
<div className="flex justify-between items-center">
  <span className={`font-medium transition-colors duration-300 ${
    darkMode ? 'text-gray-300' : 'text-gray-700'
  }`}>Costo de envío:</span>
  
  <div className="flex flex-col items-end">
    {/* Precio tachado cuando es gratis */}
    {costoEnvio === 0 && metodoPagoSeleccionado && (
      <span className="text-sm text-gray-400 line-through">
        $2,000
      </span>
    )}
    
    {/* Precio actual */}
    <span className={`font-bold transition-colors duration-300 ${
      costoEnvio === 0 ? 'text-green-600' : darkMode ? 'text-white' : 'text-gray-800'
    }`}>
      {calculandoEnvio ? '⏳ Calculando...' : 
       costoEnvio === 0 ? '🎉 GRATIS' : `$${costoEnvio.toLocaleString()}`}
    </span>
  </div>
</div>

    {/* Mensaje de envío */}
    {mensajeEnvio && (
      <div className="text-center">
        <span className={`text-sm transition-colors duration-300 ${
          costoEnvio === 0 ? 'text-green-600' : darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {mensajeEnvio}
        </span>
      </div>
    )}

    {/* Total Final */}
    <div className={`flex justify-between text-xl font-bold pt-3 border-t-2 transition-colors duration-300 ${
      darkMode ? 'border-amber-600 text-white' : 'border-amber-300 text-gray-800'
    }`}>
      <span>Total Supercasa:</span>
      <span className="text-amber-500">${totalConEnvio.toLocaleString()}</span>
    </div>
  </div>
</div>
            

            {/* ✅ BOTONES DE PAGO REDISEÑADOS CON MENSAJES CLAROS */}
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className={`text-xl font-bold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>🏗️ Elige tu método de pago</h3>
                <p className={`text-sm transition-colors duration-300 ${
                  darkMode ? 'text-amber-300' : 'text-amber-600'
                }`}>Pago seguro y entrega rápida</p>
              </div>
               {/* BOTÓN PAGO DIGITAL CON MÍNIMO $20,000 */}
<div className={`rounded-2xl border-2 p-1 transition-colors duration-300 ${
  subtotal >= 20000
    ? 'border-blue-300 bg-blue-50'
    : 'border-gray-300 bg-gray-50'
}`}>
  <button
    onClick={async () => {
      if (subtotal >= 20000) {
        const envioData = await calcularEnvio('digital');
        if (envioData) {
          finalizarCompra();
        }
      }
    }}
    disabled={subtotal < 20000 || calculandoEnvio}
    className={`w-full py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-between shadow-lg ${
      subtotal >= 20000 && !calculandoEnvio
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transform hover:scale-105'
        : 'bg-gray-400 cursor-not-allowed text-gray-200'
    }`}
  >
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-2">
        <span>💳 Pagar Digital</span>
        {calculandoEnvio && <span className="text-sm">⏳</span>}
      </div>
      <div className="text-sm font-normal">
        {subtotal >= 20000 && (
          <span className="text-blue-300">🎉 Envío gratis incluido</span>
        )}
      </div>
    </div>
    <span className="text-2xl">{subtotal >= 20000 ? '⚡' : '⚠️'}</span>
  </button>

  <div className={`px-4 py-2 text-center ${
    subtotal >= 20000 ? 'text-blue-700' : 'text-red-600'
  }`}>
    <p className="text-sm font-medium">
      {subtotal >= 20000
        ? '✅ Pago digital con envío gratis'
        : `⚠️ Mínimo pago digital: $20,000 (Te faltan: $${(20000 - subtotal).toLocaleString()})`
      }
    </p>
  </div>
</div>
              

             {/* BOTÓN PAGO EFECTIVO CON FALTANTE PARA ENVÍO GRATIS */}
<div className={`rounded-2xl border-2 p-1 transition-colors duration-300 ${
  subtotal >= 5000
    ? 'border-green-300 bg-green-50'
    : 'border-gray-300 bg-gray-50'
}`}>
  <button
    onClick={async () => {
      const envioData = await calcularEnvio('efectivo');
      if (envioData && subtotal >= 5000) {
        setCashPaymentModal(true);
      }
    }}
    disabled={subtotal < 5000 || calculandoEnvio}
    className={`w-full py-4 px-6 rounded-xl font-bold transition-all flex items-center justify-between shadow-lg ${
      subtotal >= 5000 && !calculandoEnvio
        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transform hover:scale-105'
        : 'bg-gray-400 cursor-not-allowed text-gray-200'
    }`}
  >
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-2">
        <span>🏗️ Pagar Efectivo</span>
        {calculandoEnvio && <span className="text-sm">⏳</span>}
      </div>
      <div className="text-sm font-normal">
        {metodoPagoSeleccionado === 'efectivo' && costoEnvio > 0 && (
          <span>+ ${costoEnvio.toLocaleString()} envío</span>
        )}
        {metodoPagoSeleccionado === 'efectivo' && costoEnvio === 0 && (
          <span className="text-green-300">🎉 Envío gratis</span>
        )}
      </div>
    </div>
    <span className="text-2xl">{subtotal >= 5000 ? '🏗️' : '⚠️'}</span>
  </button>

  <div className={`px-4 py-2 text-center ${
    subtotal >= 5000 ? 
      (subtotal >= 15000 ? 'text-green-700' : 'text-orange-600') 
      : 'text-red-600'
  }`}>
    <p className="text-sm font-medium">
      {subtotal < 5000 
        ? `⚠️ Monto mínimo: $5,000 (Te faltan: $${(5000 - subtotal).toLocaleString()})`
        : subtotal >= 15000 
          ? '✅ Envío gratis - Pago efectivo'
          : `💵 Efectivo + $2,000 envío. Te faltan $${(15000 - subtotal).toLocaleString()} para envío gratis`
      }
    </p>
  </div>
</div>
            </div>
          </>
        )}
      </div>
    </div>
  </div>
)}
   

      {/* Modal de checkout con branding */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 border-2 ${
            darkMode 
              ? 'bg-gray-800 border-amber-600' 
              : 'bg-white border-amber-300'
          }`}>
            <div className={`p-6 border-b transition-colors duration-300 ${
              darkMode ? 'border-amber-600' : 'border-amber-300'
            }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <SupercasaLogo 
                    size="small"
                    showText={false}
                    showSlogan={false}
                    darkMode={darkMode}
                  />
                  <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>Datos de Entrega</h2>
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className={`transition-colors duration-300 ${
                    darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 flex items-center ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>🏗️ Entrega en las 5 Torres de Supercasa</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    darkMode ? 'text-amber-300' : 'text-amber-700'
                  }`}>Torre</label>
                  <select
                    value={deliveryData.torre_entrega}
                    onChange={(e) => setDeliveryData({...deliveryData, torre_entrega: e.target.value})}
                    className={`w-full px-4 py-2 rounded-xl focus:ring-2 focus:ring-amber-500 transition-colors duration-300 border-2 ${
                      darkMode 
                        ? 'bg-gray-700 border-amber-600 text-white focus:border-transparent' 
                        : 'bg-white border-amber-200 text-gray-900 focus:border-transparent'
                    }`}
                  >
                    <option value="1">🏗️ Torre 1</option>
                    <option value="2">🏗️ Torre 2</option>
                    <option value="3">🏗️ Torre 3</option>
                    <option value="4">🏗️ Torre 4</option>
                    <option value="5">🏗️ Torre 5</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    darkMode ? 'text-amber-300' : 'text-amber-700'
                  }`}>Piso</label>
                  <input
                    type="number"
                    value={deliveryData.piso_entrega}
                    onChange={(e) => setDeliveryData({...deliveryData, piso_entrega: e.target.value})}
                    className={`w-full px-4 py-2 rounded-xl focus:ring-2 focus:ring-amber-500 transition-colors duration-300 border-2 ${
                      darkMode 
                        ? 'bg-gray-700 border-amber-600 text-white focus:border-transparent' 
                        : 'bg-white border-amber-200 text-gray-900 focus:border-transparent'
                    }`}
                    min="1"
                    max="30"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    darkMode ? 'text-amber-300' : 'text-amber-700'
                  }`}>Apartamento</label>
                  <input
                    type="text"
                    value={deliveryData.apartamento_entrega}
                    onChange={(e) => setDeliveryData({...deliveryData, apartamento_entrega: e.target.value})}
                    className={`w-full px-4 py-2 rounded-xl focus:ring-2 focus:ring-amber-500 transition-colors duration-300 border-2 ${
                      darkMode 
                        ? 'bg-gray-700 border-amber-600 text-white focus:border-transparent' 
                        : 'bg-white border-amber-200 text-gray-900 focus:border-transparent'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    darkMode ? 'text-amber-300' : 'text-amber-700'
                  }`}>Teléfono</label>
                  <input
                    type="tel"
                    value={deliveryData.telefono_contacto}
                    onChange={(e) => setDeliveryData({...deliveryData, telefono_contacto: e.target.value})}
                    className={`w-full px-4 py-2 rounded-xl focus:ring-2 focus:ring-amber-500 transition-colors duration-300 border-2 ${
                      darkMode 
                        ? 'bg-gray-700 border-amber-600 text-white focus:border-transparent' 
                        : 'bg-white border-amber-200 text-gray-900 focus:border-transparent'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    darkMode ? 'text-amber-300' : 'text-amber-700'
                  }`}>Instrucciones de Entrega</label>
                  <textarea
                    value={deliveryData.instrucciones_entrega}
                    onChange={(e) => setDeliveryData({...deliveryData, instrucciones_entrega: e.target.value})}
                    className={`w-full px-4 py-2 rounded-xl focus:ring-2 focus:ring-amber-500 transition-colors duration-300 border-2 ${
                      darkMode 
                        ? 'bg-gray-700 border-amber-600 text-white focus:border-transparent placeholder-gray-400' 
                        : 'bg-white border-amber-200 text-gray-900 focus:border-transparent'
                    }`}
                    rows="3"
                    placeholder="Ej: Llamar al celular, timbre no funciona"
                  />
                </div>
              </div>

              <div className={`border-t pt-6 transition-colors duration-300 ${
                darkMode ? 'border-amber-600' : 'border-amber-300'
              }`}>
                <div className="flex justify-between items-center text-xl font-bold mb-4">
                  <span className={`transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>Total Supercasa:</span>
                  <span className="text-amber-500">${total.toLocaleString()}</span>
                </div>

                <button
                  onClick={procederAlPago}
                  className="w-full mt-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-3 rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all font-medium shadow-lg"
                >
                  🏗️ Proceder al Pago Seguro con WOMPI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pago WOMPI con branding */}
      {showWompiPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-300 border-2 ${
            darkMode 
              ? 'bg-gray-800 border-amber-600' 
              : 'bg-white border-amber-300'
          }`}>
            <div className={`p-6 border-b transition-colors duration-300 ${
              darkMode ? 'border-amber-600' : 'border-amber-300'
            }`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <SupercasaLogo 
                    size="small"
                    showText={false}
                    showSlogan={false}
                    darkMode={darkMode}
                  />
                  <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>🏗️ Pago Seguro Supercasa</h2>
                </div>
                <button
                  onClick={cancelarPago}
                  className={`transition-colors duration-300 ${
                    darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
  <PaymentComponent
  total={totalConEnvio}
  carrito={carrito}
    deliveryData={deliveryData}
    onPaymentSuccess={handlePaymentSuccess}
    onPaymentError={handlePaymentError}
    onCancel={cancelarPago}
  />
</div>
          </div>
        </div>
      )}

      {/* MODAL DE PAGO EN EFECTIVO con branding */}
      {cashPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg p-6 max-w-md w-full transition-colors duration-300 border-2 ${
            darkMode 
              ? 'bg-gray-800 border-amber-600' 
              : 'bg-white border-amber-300'
          }`}>
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <SupercasaLogo 
                  size="small"
                  showText={false}
                  showSlogan={false}
                  darkMode={darkMode}
                  className="mr-3"
                />
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  darkMode ? 'bg-green-900' : 'bg-green-100'
                }`}>
                  <span className="text-3xl">💵</span>
                </div>
              </div>
              <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>🏗️ Pago en Efectivo Supercasa</h3>
              <p className={`transition-colors duration-300 ${
                darkMode ? 'text-amber-400' : 'text-amber-600'
              }`}>Confirma tu pedido para pago al recibir</p>
            </div>

            {/* RESUMEN con branding */}
            <div className={`p-4 rounded-lg mb-6 space-y-2 transition-colors duration-300 border ${
              darkMode 
                ? 'bg-gray-700 border-amber-600' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex justify-between text-sm">
                <span className={`transition-colors duration-300 ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                }`}>Productos:</span>
                <span className={`font-medium transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>{carrito.length} item(s)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={`transition-colors duration-300 ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                }`}>Total:</span>
                <span className="font-bold text-amber-500">${totalConEnvio.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={`transition-colors duration-300 ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                }`}>Entrega:</span>
                <span className={`font-medium transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  🏗️ Torre {deliveryData.torre_entrega || user?.torre || '1'}, 
                  Piso {deliveryData.piso_entrega || user?.piso || '1'}, 
                  Apt {deliveryData.apartamento_entrega || user?.apartamento || '101'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={`transition-colors duration-300 ${
                  darkMode ? 'text-amber-400' : 'text-amber-600'
                }`}>Tiempo:</span>
                <span className="font-medium text-amber-500">Máximo 20 minutos</span>
              </div>
            </div>

            {/* INSTRUCCIONES */}
            <div className={`border p-3 rounded-lg mb-6 transition-colors duration-300 ${
              darkMode 
                ? 'bg-orange-900 border-orange-700' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <p className={`text-sm transition-colors duration-300 ${
                darkMode ? 'text-orange-300' : 'text-orange-800'
              }`}>
                <strong>🏗️ Instrucciones Supercasa:</strong><br/>
                • Ten el dinero exacto preparado<br/>
                • El repartidor confirmará el pago al entregar<br/>
                • Recibirás confirmación inmediatamente
              </p>
            </div>

            {/* BOTONES con branding */}
            <div className="flex space-x-3">
              <button
                onClick={() => setCashPaymentModal(false)}
                className={`flex-1 py-3 transition-colors border rounded-lg duration-300 ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white border-gray-600 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-800 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={processCashPayment}
                disabled={isProcessingCash}
                className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                {isProcessingCash ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span className="animate-spin">⏳</span>
                    <span>Creando...</span>
                  </span>
                  ) : (
                  '🏗️ Confirmar Pedido'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget con branding */}
      <ChatWidget 
        productos={productos}
        agregarAlCarrito={agregarAlCarrito}
        darkMode={darkMode}
      />
      {/* Modal de Canjes de Puntos */}
{showCanjesModal && (
  <CanjesPuntos
    puntos={puntosUsuario}
    nivel={nivelUsuario}
    recompensas={recompensasDisponibles}
    onCanjear={handleCanjearRecompensa}
    onClose={() => setShowCanjesModal(false)}
    darkMode={darkMode}
  />
)}
    </div>
  );
}