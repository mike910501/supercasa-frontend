import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../config/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function CostControl({ darkMode = false }) {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [productoEditando, setProductoEditando] = useState(null);
  const [showModalCosto, setShowModalCosto] = useState(false);
  const [showModalGasto, setShowModalGasto] = useState(false);
  const [nuevoGasto, setNuevoGasto] = useState({
    concepto: '',
    monto: '',
    tipo: 'fijo',
    frecuencia: 'mensual'
  });
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mes');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [mostrarFechas, setMostrarFechas] = useState(false);

  // Función cargarDatos con useCallback para evitar warnings
  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    try {
      // Construir query params según el período
      let queryParams = `?periodo=${periodoSeleccionado}`;
      if (periodoSeleccionado === 'personalizado' && fechaInicio && fechaFin) {
        queryParams += `&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      }

      // Cargar dashboard con período
      const dashboardData = await api.get(`/api/admin/rentabilidad/dashboard${queryParams}`, navigate);
      setDashboard(dashboardData);

      // Cargar productos con márgenes
      const productosData = await api.get('/api/admin/productos/margenes', navigate);
      setProductos(productosData.productos || []);

      // Cargar gastos
      const gastosData = await api.get('/api/admin/gastos', navigate);
      setGastos(gastosData || []);

      toast.success(`💰 Datos cargados: ${dashboardData.periodo || 'Mes actual'}`);
    } catch (error) {
      toast.error('Error cargando datos: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [periodoSeleccionado, fechaInicio, fechaFin, navigate]);

  // useEffect para cargar datos cuando cambian las dependencias
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Actualizar costo de producto
  const actualizarCosto = async () => {
    if (!productoEditando) return;

    try {
      const response = await api.put(
        `/api/admin/productos/${productoEditando.id}/costo`,
        {
          costo_compra: parseInt(productoEditando.costo_compra || 0),
          margen_objetivo: parseFloat(productoEditando.margen_objetivo || 25)
        },
        navigate
      );

      if (response.success) {
        toast.success(`✅ Costo actualizado para ${productoEditando.nombre}`);
        
        if (response.precioSugerido) {
          toast(`💡 Precio sugerido: $${response.precioSugerido.toLocaleString()}`, {
            icon: '💰',
            duration: 5000
          });
        }

        setShowModalCosto(false);
        setProductoEditando(null);
        cargarDatos();
      }
    } catch (error) {
      toast.error('Error actualizando costo: ' + error.message);
    }
  };

  // Agregar nuevo gasto
  const agregarGasto = async () => {
    try {
      const response = await api.post('/api/admin/gastos', nuevoGasto, navigate);
      
      if (response.success) {
        toast.success('✅ Gasto agregado exitosamente');
        setShowModalGasto(false);
        setNuevoGasto({ concepto: '', monto: '', tipo: 'fijo', frecuencia: 'mensual' });
        cargarDatos();
      }
    } catch (error) {
      toast.error('Error agregando gasto: ' + error.message);
    }
  };

  // Eliminar gasto operativo
  const eliminarGasto = async (gastoId, concepto) => {
    if (!window.confirm(`¿Eliminar el gasto "${concepto}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/api/admin/gastos/${gastoId}`, navigate);
      
      if (response.success) {
        toast.success('✅ Gasto eliminado exitosamente');
        cargarDatos();
      }
    } catch (error) {
      toast.error('Error eliminando gasto: ' + error.message);
    }
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    if (filtro === 'todos') return true;
    if (filtro === 'sin_costo') return !producto.costo_compra || producto.costo_compra === 0;
    if (filtro === 'perdida') return producto.estado_margen === 'perdida';
    if (filtro === 'margen_bajo') return producto.estado_margen === 'margen_bajo';
    return producto.estado_margen === filtro;
  });

  // Función para obtener color según estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'perdida': return darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800';
      case 'margen_bajo': return darkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      case 'margen_normal': return darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800';
      case 'margen_alto': return darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800';
      default: return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      
      {/* SELECTOR DE PERÍODO */}
      <div className={`rounded-xl p-4 mb-6 border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-wrap items-center gap-4">
          <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📅 Período de análisis:
          </h3>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setPeriodoSeleccionado('24h');
                setMostrarFechas(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                periodoSeleccionado === '24h'
                  ? 'bg-amber-500 text-white'
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              24 horas
            </button>
            
            <button
              onClick={() => {
                setPeriodoSeleccionado('semana');
                setMostrarFechas(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                periodoSeleccionado === 'semana'
                  ? 'bg-amber-500 text-white'
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              7 días
            </button>
            
            <button
              onClick={() => {
                setPeriodoSeleccionado('mes');
                setMostrarFechas(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                periodoSeleccionado === 'mes'
                  ? 'bg-amber-500 text-white'
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Mes actual
            </button>
            
            <button
              onClick={() => {
                setPeriodoSeleccionado('mesAnterior');
                setMostrarFechas(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                periodoSeleccionado === 'mesAnterior'
                  ? 'bg-amber-500 text-white'
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Mes anterior
            </button>
            
            <button
              onClick={() => {
                setPeriodoSeleccionado('año');
                setMostrarFechas(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                periodoSeleccionado === 'año'
                  ? 'bg-amber-500 text-white'
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Año
            </button>
            
            <button
              onClick={() => {
                setPeriodoSeleccionado('personalizado');
                setMostrarFechas(true);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                periodoSeleccionado === 'personalizado'
                  ? 'bg-purple-500 text-white'
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              📅 Personalizado
            </button>
          </div>
          
          {/* Selector de fechas personalizado */}
          {mostrarFechas && (
            <div className="flex flex-wrap gap-2 items-center w-full mt-4">
              <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Desde:
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              
              <label className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Hasta:
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
              
              <button
                onClick={() => cargarDatos()}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                🔍 Aplicar
              </button>
            </div>
          )}
        </div>
        
        {/* Información del período actual */}
        {dashboard?.periodo && (
          <div className={`mt-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span className="font-medium">Mostrando:</span> {dashboard.periodo}
            {dashboard.fechaInicio && dashboard.fechaFin && (
              <span className="ml-2">
                ({new Date(dashboard.fechaInicio).toLocaleDateString()} - {new Date(dashboard.fechaFin).toLocaleDateString()})
              </span>
            )}
          </div>
        )}
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        
        {/* Card Ventas Hoy */}
        <div className={`rounded-xl p-6 border-2 ${darkMode ? 'bg-gray-800 border-amber-600' : 'bg-white border-amber-300'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              Ventas Hoy
            </span>
            <span className="text-2xl">💰</span>
          </div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ${dashboard?.ventasHoy?.total?.toLocaleString() || '0'}
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {dashboard?.ventasHoy?.pedidos || 0} pedidos
          </p>
        </div>

        {/* Card Ventas Período */}
        <div className={`rounded-xl p-6 border-2 ${darkMode ? 'bg-gray-800 border-blue-600' : 'bg-white border-blue-300'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              Ventas {periodoSeleccionado === '24h' ? '24h' : 
                      periodoSeleccionado === 'semana' ? 'Semana' :
                      periodoSeleccionado === 'año' ? 'Año' : 
                      periodoSeleccionado === 'mesAnterior' ? 'Mes Anterior' :
                      periodoSeleccionado === 'personalizado' ? 'Período' : 'Mes'}
            </span>
            <span className="text-2xl">📈</span>
          </div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ${dashboard?.ventasPeriodo?.total?.toLocaleString() || dashboard?.ventasMes?.total?.toLocaleString() || '0'}
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {dashboard?.ventasPeriodo?.pedidos || dashboard?.ventasMes?.pedidos || 0} pedidos
          </p>
        </div>

        {/* Card Gastos */}
        <div className={`rounded-xl p-6 border-2 ${darkMode ? 'bg-gray-800 border-red-600' : 'bg-white border-red-300'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              Gastos {periodoSeleccionado === '24h' ? '24h' : 
                      periodoSeleccionado === 'semana' ? 'Semana' :
                      periodoSeleccionado === 'año' ? 'Año' : 
                      periodoSeleccionado === 'mesAnterior' ? 'Mes Anterior' :
                      periodoSeleccionado === 'personalizado' ? 'Período' : 'Mes'}
            </span>
            <span className="text-2xl">💸</span>
          </div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ${dashboard?.gastos?.total?.toLocaleString() || '0'}
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {dashboard?.gastos?.factorProrrateo && dashboard.gastos.factorProrrateo !== 1 
              ? `Prorrateado x${dashboard.gastos.factorProrrateo.toFixed(2)}`
              : 'Fijos + Variables'}
          </p>
        </div>

        {/* Card Margen Promedio */}
        <div className={`rounded-xl p-6 border-2 ${darkMode ? 'bg-gray-800 border-purple-600' : 'bg-white border-purple-300'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              Margen Promedio
            </span>
            <span className="text-2xl">📊</span>
          </div>
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {dashboard?.margenes?.margenPromedio || dashboard?.margenes?.margenBruto || 0}%
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Productos con costo: {dashboard?.analisis?.productosConCosto || 0}
          </p>
        </div>

        {/* Card Margen Neto */}
        <div className={`rounded-xl p-6 border-2 ${darkMode ? 'bg-gray-800 border-green-600' : 'bg-white border-green-300'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              Margen Neto
            </span>
            <span className="text-2xl">🎯</span>
          </div>
          <div className={`text-2xl font-bold ${
            dashboard?.margenes?.margenNeto >= 0 
              ? darkMode ? 'text-green-400' : 'text-green-600'
              : darkMode ? 'text-red-400' : 'text-red-600'
          }`}>
            {dashboard?.margenes?.margenNeto || 0}%
          </div>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Utilidad: ${dashboard?.margenes?.utilidadNeta?.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* ALERTAS */}
      {dashboard?.alertas?.length > 0 && (
        <div className={`rounded-xl p-4 mb-6 border-2 ${darkMode ? 'bg-red-900 border-red-600' : 'bg-red-50 border-red-300'}`}>
          <h3 className={`font-bold mb-2 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
            ⚠️ Productos que requieren atención
          </h3>
          <div className="space-y-1">
            {dashboard.alertas.slice(0, 5).map((producto, idx) => (
              <div key={idx} className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-700'}`}>
                • {producto.nombre}: {producto.estado === 'perdida' ? '❌ En pérdida' : '⚠️ Margen bajo'} 
                ({producto.margen_porcentaje || 0}%)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANÁLISIS DETALLADO */}
      {dashboard?.analisis && (
        <div className={`rounded-xl p-4 mb-6 border-2 ${darkMode ? 'bg-blue-900 border-blue-600' : 'bg-blue-50 border-blue-300'}`}>
          <h3 className={`font-bold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
            📊 Análisis de Rentabilidad
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              <strong>Método de cálculo:</strong><br/>
              {dashboard.analisis.metodoCalculo}
            </div>
            <div className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              <strong>Margen promedio real:</strong><br/>
              {dashboard.margenes.margenPromedio}% (de {dashboard.analisis.productosConCosto} productos)
            </div>
            <div className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              <strong>Costo productos período:</strong><br/>
              ${dashboard.analisis.costoCalculado?.toLocaleString()}
            </div>
          </div>
          <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-blue-700' : 'border-blue-300'}`}>
            <div className={`text-sm ${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
              <strong>Fórmula:</strong> Ventas (${(dashboard.ventasPeriodo?.total || dashboard.ventasMes?.total)?.toLocaleString()}) 
              - Costo Productos (${dashboard.analisis.costoCalculado?.toLocaleString()}) 
              - Gastos (${dashboard.gastos.total?.toLocaleString()}) 
              = Utilidad Neta (${dashboard.margenes.utilidadNeta?.toLocaleString()})
            </div>
          </div>
        </div>
      )}

      {/* FILTROS */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filtro === 'todos'
              ? 'bg-amber-500 text-white'
              : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Todos ({productos.length})
        </button>
        <button
          onClick={() => setFiltro('sin_costo')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filtro === 'sin_costo'
              ? 'bg-gray-500 text-white'
              : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Sin Costo
        </button>
        <button
          onClick={() => setFiltro('perdida')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filtro === 'perdida'
              ? 'bg-red-500 text-white'
              : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}
        >
          En Pérdida
        </button>
        <button
          onClick={() => setFiltro('margen_bajo')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filtro === 'margen_bajo'
              ? 'bg-yellow-500 text-white'
              : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Margen Bajo
        </button>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className={`rounded-xl overflow-hidden border-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <table className="w-full">
          <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Producto
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Precio Venta
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Costo
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Margen %
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Estado
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {productosFiltrados.map((producto) => (
              <tr key={producto.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <div>
                    <div className="font-medium">{producto.nombre}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {producto.categoria}
                    </div>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  ${producto.precio?.toLocaleString() || 0}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  ${producto.costo_compra?.toLocaleString() || '---'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {producto.margen_actual ? `${producto.margen_actual}%` : '---'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getEstadoColor(producto.estado_margen)}`}>
                    {producto.estado_margen === 'perdida' && '❌ Pérdida'}
                    {producto.estado_margen === 'margen_bajo' && '⚠️ Bajo'}
                    {producto.estado_margen === 'margen_normal' && '✅ Normal'}
                    {producto.estado_margen === 'margen_alto' && '🌟 Alto'}
                    {producto.estado_margen === 'sin_costo' && '❓ Sin costo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setProductoEditando(producto);
                      setShowModalCosto(true);
                    }}
                    className="text-amber-600 hover:text-amber-900 font-medium text-sm"
                  >
                    💰 Editar Costo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECCIÓN GASTOS */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            💸 Gastos Operativos
          </h2>
          <button
            onClick={() => setShowModalGasto(true)}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
          >
            ➕ Agregar Gasto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gastos.map((gasto) => (
            <div key={gasto.id} className={`rounded-lg p-4 border relative ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              {/* Botón eliminar */}
              <button
                onClick={() => eliminarGasto(gasto.id, gasto.concepto)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                title="Eliminar gasto"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="flex justify-between items-start pr-8">
                <div>
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {gasto.concepto}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {gasto.tipo} - {gasto.frecuencia}
                  </p>
                </div>
                <span className={`text-lg font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                  ${gasto.monto?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL EDITAR COSTO */}
      {showModalCosto && productoEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl max-w-md w-full p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💰 Editar Costo - {productoEditando.nombre}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Costo de Compra
                </label>
                <input
                  type="number"
                  value={productoEditando.costo_compra || ''}
                  onChange={(e) => setProductoEditando({
                    ...productoEditando,
                    costo_compra: e.target.value
                  })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="0"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Margen Objetivo (%)
                </label>
                <input
                  type="number"
                  value={productoEditando.margen_objetivo || 25}
                  onChange={(e) => setProductoEditando({
                    ...productoEditando,
                    margen_objetivo: e.target.value
                  })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="25"
                />
              </div>

              {productoEditando.costo_compra > 0 && productoEditando.margen_objetivo > 0 && (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Precio actual: ${productoEditando.precio?.toLocaleString()}
                  </p>
                  <p className={`text-sm font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    Precio sugerido: ${Math.round(productoEditando.costo_compra / (1 - productoEditando.margen_objetivo / 100)).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModalCosto(false);
                  setProductoEditando(null);
                }}
                className={`flex-1 py-2 rounded-lg border ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={actualizarCosto}
                className="flex-1 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AGREGAR GASTO */}
      {showModalGasto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`rounded-xl max-w-md w-full p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              💸 Agregar Gasto Operativo
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Concepto
                </label>
                <input
                  type="text"
                  value={nuevoGasto.concepto}
                  onChange={(e) => setNuevoGasto({...nuevoGasto, concepto: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Ej: Arriendo local"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Monto
                </label>
                <input
                  type="number"
                  value={nuevoGasto.monto}
                  onChange={(e) => setNuevoGasto({...nuevoGasto, monto: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="0"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tipo
                </label>
                <select
                  value={nuevoGasto.tipo}
                  onChange={(e) => setNuevoGasto({...nuevoGasto, tipo: e.target.value})}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="fijo">Fijo</option>
                  <option value="variable">Variable</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModalGasto(false);
                  setNuevoGasto({ concepto: '', monto: '', tipo: 'fijo', frecuencia: 'mensual' });
                }}
                className={`flex-1 py-2 rounded-lg border ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={agregarGasto}
                className="flex-1 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}