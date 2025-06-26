// src/components/ToastProvider.jsx
// Proveedor de notificaciones elegantes para Supercasa

import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Configuración por defecto para todos los toasts
        className: '',
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#1f2937',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '400px'
        },
        
        // Estilos específicos por tipo
        success: {
          style: {
            background: '#10b981',
            color: '#ffffff',
            border: '1px solid #059669'
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#10b981'
          }
        },
        
        error: {
          style: {
            background: '#ef4444',
            color: '#ffffff',
            border: '1px solid #dc2626'
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#ef4444'
          }
        },
        
        loading: {
          style: {
            background: '#3b82f6',
            color: '#ffffff',
            border: '1px solid #2563eb'
          }
        }
      }}
    />
  );
};

export default ToastProvider;