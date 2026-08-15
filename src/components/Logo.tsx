import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const fontSizes = {
    sm: 'text-lg',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-4xl sm:text-5xl',
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-1.5 group tracking-tight focus:outline-none select-none ${className}`}>
      <div className="flex items-center font-black tracking-wider uppercase font-sans">
        <div className="flex items-center text-[#E8483F]">
          <span className={`${fontSizes[size]} font-black tracking-wider`}>F</span>
          <span className={`${fontSizes[size]} font-black tracking-wider text-[#E8483F]`}>O</span>
          <span className={`${fontSizes[size]} font-black tracking-wider text-[#E8483F]`}>O</span>
          <span className={`${fontSizes[size]} font-black tracking-wider`}>D</span>
        </div>
        <span className={`${fontSizes[size]} font-black tracking-wider text-[#242424] ml-2`}>
          MART
        </span>
      </div>
    </Link>
  );
};
