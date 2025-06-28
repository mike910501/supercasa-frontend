import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_URL, { api } from '../config/api';
import { toast } from 'react-hot-toast';
import { restoreCartAfterLogin, hasTemporaryCart } from '../utils/authHandler';
import WompiCheckout from '../components/WompiCheckout';

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
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

// Componente de Login MIGRADO
function LoginForm({ onLogin, onSwitchToRegister }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    if (!formData.email || !formData.password) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      const loadingToast = toast.loading('Iniciando sesión...');

      const response = await api.post('/auth/login', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      }, navigate);

      toast.dismiss(loadingToast);

      if (response.token && response.user) {
        // Restaurar carrito si existe
        const carritoRestaurado = restoreCartAfterLogin();
        
        // Mensaje de bienvenida diferenciado
        if (carritoRestaurado) {
          // Ya se muestra el mensaje en restoreCartAfterLogin()
        } else {
          toast.success(`¡Bienvenido, ${response.user.nombre}!`, {
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
      } else if (error.message.includes('credenciales') || error.message.includes('password')) {
        toast.error('Email o contraseña incorrectos');
      } else if (error.message.includes('usuario no encontrado')) {
        toast.error('Este email no está registrado');
      } else {
        toast.error(error.message || 'Error al iniciar sesión');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl inline-block mb-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Supercasa</h2>
          <p className="text-gray-600">Conjunto Residencial</p>
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Contraseña</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-medium text-white transition-all ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 font-medium"
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

// Componente de Registro - mantengo igual que antes para no hacer el mensaje muy largo
function RegisterForm({ onRegister, onSwitchToLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    telefono_alternativo: '',
    torre: '',
    piso: '',
    apartamento: '',
    notas_entrega: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.email || !formData.password || !formData.torre || !formData.piso || !formData.apartamento) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
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
        toast.success(`¡Bienvenido a Supercasa, ${response.user.nombre}!`, {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registro Supercasa</h2>
          <p className="text-gray-600">Únete a nuestro conjunto</p>
        </div>
        {/* Resto del formulario mantener igual que tienes */}
      </div>
    </div>
  );
}

// Componente principal de la tienda CON WOMPI
function Store({ user, token, onLogout }) {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showWompiPayment, setShowWompiPayment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
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

  // Cargar productos MIGRADO
  useEffect(() => {
    obtenerProductos();
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

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  const obtenerProductos = async () => {
    setIsLoading(true);
    try {
      const productos = await api.get('/productos', navigate);
      console.log("Productos cargados desde la base de datos:", productos);
      setProductos(productos);
    } catch (error) {
      toast.error('Error al cargar productos: ' + error.message);
      setProductos([]);
    } finally {
      setIsLoading(false);
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
    const productoExistente = carrito.find(item => item.id === producto.id);
    
    if (productoExistente) {
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
    
    toast.success(`${producto.nombre} agregado al carrito`, {
      duration: 2000,
      icon: '🛒'
    });
  };

  const eliminarDelCarrito = (productoId) => {
    const productoExistente = carrito.find(item => item.id === productoId);
    
    if (productoExistente.cantidad > 1) {
      setCarrito(carrito.map(item =>
        item.id === productoId
          ? { ...item, cantidad: item.cantidad - 1 }
          : item
      ));
    } else {
      setCarrito(carrito.filter(item => item.id !== productoId));
    }
  };

  const finalizarCompra = async () => {
    if (carrito.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    setShowCheckout(true);
  };

  const procederAlPago = () => {
    // Validación de datos de entrega
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

  // ✅ CALLBACK CORREGIDO - VALIDACIÓN COMPATIBLE CON BACKEND
  const handlePaymentSuccess = async (paymentData) => {
    console.log('💳 PAGO EXITOSO CONFIRMADO:', paymentData);

    // ✅ VALIDACIÓN CORREGIDA - Compatible con respuesta del backend
    if (paymentData.success && paymentData.pedidoId) {
      console.log('✅ ¡Pago y pedido exitosos!');
      
      toast.success('¡Pago aprobado y pedido creado exitosamente!', {
        duration: 6000,
        icon: '🎉'
      });

      // ✅ LIMPIAR Y CERRAR TODO
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

  // ✅ CALLBACK PARA ERRORES DE PAGO
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

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.80a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Supercasa
                </h1>
                <p className="text-sm text-gray-600">
                  Torre {user.torre}, Piso {user.piso}, Apt {user.apartamento}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-gray-600">Hola, {user.nombre}</span>
              </div>
              
              <div className="hidden lg:flex items-center bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
                <span className="text-green-800 text-sm font-medium">💳 Pago seguro + entrega 20 min</span>
              </div>
              
              {user.rol === 'admin' && (
                <Link
                  to="/admin"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  🔧 Panel Admin
                </Link>
              )}
              
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
              
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-xl hover:bg-gray-100 transition-all"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 01-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner de entrega rápida móvil */}
      <div className="lg:hidden bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 text-center">
        <div className="flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
          </svg>
          <span className="font-medium">💳 Pago seguro + entrega en máximo 20 minutos</span>
        </div>
      </div>

      {/* Filtros y búsqueda - mantener igual */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={categoriaSeleccionada}
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid de productos - mantener igual */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosFiltrados.map(producto => (
            <div key={producto.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105">
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{producto.nombre}</h3>
                <p className="text-gray-600 text-sm mb-2">{producto.categoria}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-blue-600">
                    ${producto.precio.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stock: {producto.stock}
                  </span>
                </div>
                <button
                  onClick={() => agregarAlCarrito(producto)}
                  disabled={producto.stock === 0}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {productosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron productos</h3>
            <p className="text-gray-500">Intenta con otros términos de búsqueda o categorías</p>
          </div>
        )}
      </div>

      {/* Modal del carrito - mantener igual */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Tu Carrito</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {carrito.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">🛒</div>
                  <p className="text-gray-600">Tu carrito está vacío</p>
                </div>
              ) : (
                <>
                  {carrito.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-4 border-b border-gray-100">
                      <div className="flex items-center space-x-4">
                        <img src={item.imagen} alt={item.nombre} className="w-16 h-16 object-cover rounded-lg" />
                        <div>
                          <h3 className="font-semibold text-gray-800">{item.nombre}</h3>
                          <p className="text-gray-600">${item.precio.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => eliminarDelCarrito(item.id)}
                          className="bg-red-100 text-red-600 p-1 rounded-lg hover:bg-red-200"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                          </svg>
                        </button>
                        <span className="px-3 py-1 bg-gray-100 rounded-lg">{item.cantidad}</span>
                        <button
                          onClick={() => agregarAlCarrito(item)}
                          className="bg-blue-100 text-blue-600 p-1 rounded-lg hover:bg-blue-200"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-gray-800">Total:</span>
                      <span className="text-2xl font-bold text-blue-600">${total.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={finalizarCompra}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all"
                    >
                      💳 Proceder al Pago Seguro
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de checkout - datos de entrega */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Confirmar Datos de Entrega</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">📍 Datos de Entrega</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Torre</label>
                  <select
                    value={deliveryData.torre_entrega}
                    onChange={(e) => setDeliveryData({...deliveryData, torre_entrega: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">Torre 1</option>
                    <option value="2">Torre 2</option>
                    <option value="3">Torre 3</option>
                    <option value="4">Torre 4</option>
                    <option value="5">Torre 5</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Piso</label>
                  <input
                    type="number"
                    value={deliveryData.piso_entrega}
                    onChange={(e) => setDeliveryData({...deliveryData, piso_entrega: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="30"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Apartamento</label>
                  <input
                    type="text"
                    value={deliveryData.apartamento_entrega}
                    onChange={(e) => setDeliveryData({...deliveryData, apartamento_entrega: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={deliveryData.telefono_contacto}
                    onChange={(e) => setDeliveryData({...deliveryData, telefono_contacto: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Instrucciones de Entrega</label>
                  <textarea
                    value={deliveryData.instrucciones_entrega}
                    onChange={(e) => setDeliveryData({...deliveryData, instrucciones_entrega: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Ej: Llamar al celular, timbre no funciona"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center text-xl font-bold mb-4">
                  <span>Total a pagar:</span>
                  <span className="text-blue-600">${total.toLocaleString()}</span>
                </div>

                <button
                  onClick={procederAlPago}
                  className="w-full mt-4 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all font-medium"
                >
                  💳 Proceder al Pago Seguro con WOMPI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pago WOMPI - NUEVO */}
      {showWompiPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">💳 Pago Seguro con WOMPI</h2>
                <button
                  onClick={cancelarPago}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <WompiCheckout
                total={total}
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
    </div>
  );
}