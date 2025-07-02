import React, { useState } from 'react';

const CopyButton = ({ text, size = 'sm' }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      // Resetear después de 2 segundos
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Error copiando al clipboard:', err);
      
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm'
  };

  return (
    <button
      onClick={copyToClipboard}
      className={`inline-flex items-center gap-1 rounded-lg font-medium transition-all duration-200 ${sizeClasses[size]} ${
        copied
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300 hover:border-gray-400'
      }`}
      disabled={copied}
    >
      {copied ? (
        <>
          <span>✅</span>
          <span>Copiado</span>
        </>
      ) : (
        <>
          <span>📋</span>
          <span>Copiar</span>
        </>
      )}
    </button>
  );
};

export default CopyButton;