import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // ⚡ AGREGADO: Import para navegación
import API_URL from '../config/api'; // ⚡ AGREGADO: Import de configuración de API

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

// Componente de Login
function LoginForm({ onLogin, onSwitchToRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // ✅ CORREGIDO: URL dinámica con template literals correctos
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user, data.token);
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      setError('Error de conexión. Asegúrate de que el servidor esté corriendo.');
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
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
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente de Registro para Conjunto Residencial
function RegisterForm({ onRegister, onSwitchToLogin }) {
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
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.email || !formData.password || !formData.torre || !formData.piso || !formData.apartamento) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!['1', '2', '3', '4'].includes(formData.torre)) {
      setError('Selecciona una torre válida');
      return;
    }

    if (formData.piso < 1 || formData.piso > 30) {
      setError('El piso debe estar entre 1 y 30');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // ✅ CORREGIDO: URL dinámica con template literals correctos
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        onRegister(data.user, data.token);
      } else {
        setError(data.error || 'Error al registrarse');
      }
    } catch (error) {
      setError('Error de conexión. Asegúrate de que el servidor esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-3 rounded-xl inline-block mb-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registro Conjunto Residencial</h2>
          <p className="text-gray-600">Únete a Supercasa - Solo para residentes</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Información personal */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">📋 Información Personal</h3>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Nombre completo *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Contraseña *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Confirmar contraseña *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          {/* Información de contacto */}
          <div className="md:col-span-2 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">📞 Contacto</h3>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Teléfono principal *</label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="300-123-4567"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Teléfono alternativo</label>
            <input
              type="tel"
              value={formData.telefono_alternativo}
              onChange={(e) => setFormData({...formData, telefono_alternativo: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="310-123-4567"
            />
          </div>

          {/* Información residencial */}
          <div className="md:col-span-2 mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">🏢 Ubicación en el Conjunto</h3>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Torre *</label>
            <select
              value={formData.torre}
              onChange={(e) => setFormData({...formData, torre: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona tu torre</option>
              <option value="1">Torre 1</option>
              <option value="2">Torre 2</option>
              <option value="3">Torre 3</option>
              <option value="4">Torre 4</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Piso *</label>
            <select
              value={formData.piso}
              onChange={(e) => setFormData({...formData, piso: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona el piso</option>
              {Array.from({length: 30}, (_, i) => i + 1).map(piso => (
                <option key={piso} value={piso}>Piso {piso}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-1">Apartamento *</label>
            <input
              type="text"
              value={formData.apartamento}
              onChange={(e) => setFormData({...formData, apartamento: e.target.value.toUpperCase()})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 101, 102A, 103B"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-1">Notas para entrega</label>
            <textarea
              value={formData.notas_entrega}
              onChange={(e) => setFormData({...formData, notas_entrega: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Timbre roto, llamar al celular. Portería principal."
              rows="2"
            />
          </div>

          <div className="md:col-span-2 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-1 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Solo para residentes del conjunto</p>
                  <p>Verificaremos tu dirección antes de aprobar el registro. Solo un registro por apartamento.</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
            >
              {isLoading ? 'Registrando...' : 'Registrarse en Supercasa'}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente principal de la tienda
function Store({ user, token, onLogout }) {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Datos de entrega específicos para conjunto residencial
  const [deliveryData, setDeliveryData] = useState({
    torre_entrega: user?.torre || '1',
    piso_entrega: user?.piso || '',
    apartamento_entrega: user?.apartamento || '',
    instrucciones_entrega: user?.notas_entrega || '',
    horario_preferido: '',
    telefono_contacto: user?.telefono || ''
  });

  // Actualizar deliveryData cuando user cambie
  useEffect(() => {
    if (user) {
      setDeliveryData({
        torre_entrega: user.torre || '1',
        piso_entrega: user.piso || '',
        apartamento_entrega: user.apartamento || '',
        instrucciones_entrega: user.notas_entrega || '',
        horario_preferido: '',
        telefono_contacto: user.telefono || ''
      });
    }
  }, [user]);

  // Cargar productos desde la base de datos
  useEffect(() => {
    setIsLoading(true);
    // ✅ CORREGIDO: URL dinámica con template literals correctos
    fetch(`${API_URL}/productos`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Productos cargados desde la base de datos:", data);
        setProductos(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error al cargar los productos:', error);
        setProductos([]);
        setIsLoading(false);
      });
  }, []);

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
      alert('El carrito está vacío');
      return;
    }
    setShowCheckout(true);
  };

  const confirmarPedido = async () => {
    const totalPedido = carrito.reduce((acc, item) => acc + Number(item.precio) * item.cantidad, 0);

    // Debug: Mostrar datos de entrega
    console.log('Datos de entrega:', deliveryData);

    // Validación mejorada
    if (!deliveryData.torre_entrega) {
      alert('Por favor selecciona la torre de entrega');
      return;
    }
    if (!deliveryData.piso_entrega) {
      alert('Por favor ingresa el piso de entrega');
      return;
    }
    if (!deliveryData.apartamento_entrega) {
      alert('Por favor ingresa el apartamento de entrega');
      return;
    }

    try {
      // ✅ CORREGIDO: URL dinámica con template literals correctos
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productos: carrito,
          total: totalPedido,
          ...deliveryData
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ Pedido realizado correctamente\n📍 Entrega: Torre ${deliveryData.torre_entrega}, Piso ${deliveryData.piso_entrega}, Apt ${deliveryData.apartamento_entrega}\n📱 Te contactaremos para coordinar la entrega`);
        setCarrito([]);
        setShowCart(false);
        setShowCheckout(false);
      } else {
        const err = await res.json();
        alert('❌ Error al realizar el pedido: ' + err.error);
      }
    } catch (error) {
      alert('❌ Error de red al realizar el pedido');
      console.error(error);
    }
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
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Supercasa
                </h1>
                <p className="text-sm text-gray-600">
                  {user.direccion || `Torre ${user.torre}, Piso ${user.piso}, Apt ${user.apartamento}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-gray-600">Hola, {user.nombre}</span>
              </div>
              
              {/* ⚡ AGREGADO: Botón Panel Admin solo para usuarios admin */}
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

      {/* Filtros y búsqueda */}
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

        {/* Grid de productos */}
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

      {/* Modal del carrito */}
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
                      Finalizar Compra
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de checkout */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Confirmar Pedido</h2>
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
                  <label className="block text-gray-700 text-sm font-medium mb-2">Horario Preferido</label>
                  <select
                    value={deliveryData.horario_preferido}
                    onChange={(e) => setDeliveryData({...deliveryData, horario_preferido: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona horario</option>
                    <option value="mañana">Mañana (8:00 AM - 12:00 PM)</option>
                    <option value="tarde">Tarde (12:00 PM - 6:00 PM)</option>
                    <option value="noche">Noche (6:00 PM - 9:00 PM)</option>
                  </select>
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
                <h3 className="text-lg font-semibold mb-4">📦 Resumen del Pedido</h3>
                {carrito.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2">
                    <span>{item.nombre} x{item.cantidad}</span>
                    <span>${(item.precio * item.cantidad).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">${total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={confirmarPedido}
                  className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all"
                >
                  Confirmar Pedido
                </button>
                
                {/* Botón temporal de debug */}
                <button
                  onClick={() => {
                    console.log('DEBUG - Datos de entrega:', deliveryData);
                    console.log('DEBUG - Usuario:', user);
                    alert(`DEBUG:\nTorre: "${deliveryData.torre_entrega}"\nPiso: "${deliveryData.piso_entrega}"\nApt: "${deliveryData.apartamento_entrega}"\nTeléfono: "${deliveryData.telefono_contacto}"`);
                  }}
                  className="w-full mt-2 bg-gray-500 text-white py-2 rounded-xl hover:bg-gray-600 transition-all text-sm"
                >
                  🔍 Debug - Ver Datos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}