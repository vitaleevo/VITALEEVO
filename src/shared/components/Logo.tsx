import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`relative ${className || 'w-40 h-10'}`}>
      <Image
        src="/logo.png"
        alt="Vitaleevo Logo"
        fill
        sizes="(max-width: 768px) 120px, 160px"
        className="object-contain object-left"
        priority
        unoptimized
      />
    </div>
  );
};

export default Logo;
