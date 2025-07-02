
import React from 'react';

interface IconProps {
  className?: string;
}

export const FireIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.62a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.453zM12 12.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75V12.75M10.125 11.25H13.875" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-1.243 0-2.43-.193-3.537-.543M12 21c1.243 0 2.43.193 3.537.543M12 21c-3.105 0-5.836-1.624-7.463-3.961M12 21c3.105 0 5.836-1.624 7.463-3.961M12 3.75c-3.105 0-5.836 1.624-7.463 3.961M12 3.75c3.105 0 5.836 1.624 7.463 3.961" />
  </svg>
);
