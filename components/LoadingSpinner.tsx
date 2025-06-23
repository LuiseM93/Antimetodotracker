
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'var(--color-primary)', // Default to CSS variable
  text 
}) => {
  let sizeClasses = '';
  switch (size) {
    case 'sm': sizeClasses = 'w-6 h-6 border-2'; break;
    case 'md': sizeClasses = 'w-10 h-10 border-4'; break;
    case 'lg': sizeClasses = 'w-16 h-16 border-[6px]'; break;
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div 
        className={`animate-spin rounded-full ${sizeClasses} border-t-transparent`}
        style={{ borderColor: color, borderTopColor: 'transparent' }} 
      />
      {text && <p className="text-sm font-poppins" style={{color: color}}>{text}</p>}
    </div>
  );
};
