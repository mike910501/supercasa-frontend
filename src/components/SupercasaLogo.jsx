import React from 'react';

const SupercasaLogo = ({ 
  size = 'medium', 
  showText = true, 
  showSlogan = false, 
  darkMode = false,
  className = '',
  onClick 
}) => {
  const sizes = {
    small: {
      circle: 'w-10 h-10',
      towers: 'gap-1 p-2',
      tower: 'w-1.5 h-3 rounded-[1px]',
      text: 'text-sm',
      slogan: 'text-xs'
    },
    medium: {
      circle: 'w-12 h-12 md:w-16 md:h-16',
      towers: 'gap-1 md:gap-1.5 p-2 md:p-3',
      tower: 'w-1.5 h-4 md:w-2 md:h-6 rounded-[1px]',
      text: 'text-lg md:text-2xl',
      slogan: 'text-xs md:text-sm'
    },
    large: {
      circle: 'w-20 h-20 md:w-24 md:h-24',
      towers: 'gap-2 p-4 md:p-5',
      tower: 'w-2 h-6 md:w-3 md:h-8 rounded-[1px]',
      text: 'text-2xl md:text-3xl',
      slogan: 'text-sm md:text-base'
    }
  };

  const currentSize = sizes[size];

  return (
    <div 
      className={`flex items-center gap-3 md:gap-4 ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {/* Logo de las 5 Torres Animado */}
      <div className={`
        ${currentSize.circle}
        bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600
        rounded-full
        shadow-lg
        flex items-end justify-center
        ${currentSize.towers}
        supercasa-logo-pulse
        hover:scale-105
        transition-all duration-300
        relative
        overflow-hidden
      `}>
        {/* Efecto de brillo */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-full supercasa-shimmer"></div>
        
        {/* Torre 1 */}
        <div className={`
          ${currentSize.tower}
          bg-white/90
          supercasa-tower-glow
        `} style={{ height: '30%' }}></div>
        
        {/* Torre 2 */}
        <div className={`
          ${currentSize.tower}
          bg-white/90
          supercasa-tower-glow
        `} style={{ height: '45%', animationDelay: '0.2s' }}></div>
        
        {/* Torre 3 - La más alta */}
        <div className={`
          ${currentSize.tower}
          bg-white/90
          supercasa-tower-glow
        `} style={{ height: '60%', animationDelay: '0.4s' }}></div>
        
        {/* Torre 4 */}
        <div className={`
          ${currentSize.tower}
          bg-white/90
          supercasa-tower-glow
        `} style={{ height: '40%', animationDelay: '0.6s' }}></div>
        
        {/* Torre 5 */}
        <div className={`
          ${currentSize.tower}
          bg-white/90
          supercasa-tower-glow
        `} style={{ height: '25%', animationDelay: '0.8s' }}></div>

        {/* Ondas de pulsación */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-300/50 supercasa-ripple"></div>
        <div className="absolute inset-0 rounded-full border-2 border-amber-300/30 supercasa-ripple-delayed"></div>
      </div>

      {/* Texto y Slogan */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`
            ${currentSize.text}
            font-bold
            bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600
            bg-clip-text text-transparent
            ${darkMode ? 'drop-shadow-sm' : ''}
          `}>
            Supercasa
          </h1>
          
          {showSlogan && (
            <p className={`
              ${currentSize.slogan}
              font-medium
              ${darkMode ? 'text-amber-300' : 'text-amber-600'}
              mt-1
              supercasa-fade-in-up
            `}>
              "Tu supermercado en casa, en 20 minutos"
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SupercasaLogo;