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
        alt="VitalEvo Logo"
        fill
        className="object-contain object-left"
        priority
      />
    </div>
  );
};

export default Logo;
