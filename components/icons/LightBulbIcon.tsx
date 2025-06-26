
import React from 'react';

interface IconProps {
  className?: string;
}

export const LightBulbIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.355a7.5 7.5 0 01-3 0m3 0a7.5 7.5 0 00-3 0m.375 0a6.04 6.04 0 01-3.375 0m6.375 0a6.04 6.04 0 00-3.375 0m3.375 0c-.396.09-.806.15-1.23.189m0 0c-.424-.039-.834-.099-1.23-.189m2.46 0a6.043 6.043 0 01-4.92 0m0 0A6.963 6.963 0 015.25 6.75c0-1.79.645-3.442 1.714-4.732a6.044 6.044 0 017.072 0A6.963 6.963 0 0118.75 6.75c0 .993-.223 1.928-.621 2.768M9 4.875A6.03 6.03 0 0112 3m0 18c-1.306 0-2.528-.42-3.536-1.159M12 3c1.306 0 2.528.42 3.536 1.159" />
  </svg>
);
