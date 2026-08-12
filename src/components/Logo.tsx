import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const fontSizes = {
    sm: 'text-lg',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-4xl sm:text-5xl'
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-1.5 group tracking-tight focus:outline-none select-none ${className}`}>
      {/* FOOD MART - Single Unified Font Family & Style (Equinox-style Geometric Bold) */}
      <div className="flex items-center font-logo font-black tracking-wider uppercase">
        {/* FOOD in #E8483F */}
        <div className="flex items-center text-[#E8483F]">
          <span className={`${fontSizes[size]} font-logo font-black tracking-wider`}>F</span>
          <span className={`${fontSizes[size]} font-logo font-black tracking-wider text-[#E8483F]`}>O</span>
          <span className={`${fontSizes[size]} font-logo font-black tracking-wider text-[#E8483F]`}>O</span>
          <span className={`${fontSizes[size]} font-logo font-black tracking-wider`}>D</span>
        </div>

        {/* MART in #242424 - EXACT SAME FONT FAMILY AND WEIGHT */}
        <span className={`${fontSizes[size]} font-logo font-black tracking-wider text-[#242424] ml-2`}>
          MART
        </span>
      </div>
    </Link>
  );
};
