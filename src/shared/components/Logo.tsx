import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`relative ${className || 'w-48 h-12 sm:w-56'}`}>
      <Image
        src="/logo-novo.png"
        alt="Vitaleevo Logo"
        fill
        sizes="(max-width: 768px) 176px, 224px"
        className="object-contain object-left"
        priority
        unoptimized
      />
    </div>
  );
};

export default Logo;