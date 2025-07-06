
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'font-poppins font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-150 ease-in-out inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';

  let variantStyle = '';
  switch (variant) {
    case 'primary':
      variantStyle = `bg-[var(--color-primary)] hover:bg-purple-800 text-white focus:ring-[var(--color-primary)]`;
      break;
    case 'secondary':
      variantStyle = `bg-[var(--color-secondary)] hover:bg-purple-700 text-white focus:ring-[var(--color-secondary)]`;
      break;
    case 'accent':
      variantStyle = `bg-[var(--color-accent)] hover:bg-purple-600 text-white focus:ring-[var(--color-accent)]`;
      break;
    case 'outline':
      variantStyle = `border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-light-purple)] hover:text-[var(--color-primary)] focus:ring-[var(--color-primary)]`;
      break;
    case 'ghost':
      variantStyle = `text-[var(--color-primary)] hover:bg-[var(--color-light-purple)] focus:ring-[var(--color-primary)]`;
      break;
    case 'danger':
      variantStyle = `bg-[var(--color-error)] hover:bg-red-600 text-white focus:ring-[var(--color-error)]`;
      break;
    case 'warning':
      variantStyle = `bg-[var(--color-warning)] hover:bg-orange-600 text-white focus:ring-[var(--color-warning)]`;
      break;
    case 'success':
      variantStyle = `bg-[var(--color-success)] hover:bg-green-600 text-white focus:ring-[var(--color-success)]`;
      break;
  }

  let sizeStyle = '';
  switch (size) {
    case 'sm':
      sizeStyle = 'px-3 py-1.5 text-sm';
      break;
    case 'md':
      sizeStyle = 'px-4 py-2 text-base';
      break;
    case 'lg':
      sizeStyle = 'px-6 py-3 text-lg';
      break;
  }

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
