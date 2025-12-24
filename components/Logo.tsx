
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-1 font-display font-black text-2xl tracking-tighter ${className}`}>
      <span className="text-primary dark:text-white">VITAL</span>
      <div className="flex flex-col justify-center gap-[3px] h-6 w-5 mx-0.5">
        <div className="h-[4px] w-full rounded-full bg-secondary"></div>
        <div className="h-[4px] w-full rounded-full bg-secondary"></div>
        <div className="h-[4px] w-full rounded-full bg-secondary"></div>
      </div>
      <span className="text-primary dark:text-white">VO</span>
    </div>
  );
};

export default Logo;
