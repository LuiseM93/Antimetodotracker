import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleClassName?: string;
  headerContent?: React.ReactNode; // For extra content in header like buttons
  onClick?: () => void; // Add onClick prop
  contentPaddingClass?: string; // New prop for conditional content padding
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, titleClassName = '', headerContent, onClick, contentPaddingClass = 'p-4 sm:p-5' }) => {
  return (
        <div
      className={`bg-[var(--color-card-bg)] shadow-lg rounded-xl overflow-hidden transition-colors duration-300 ${className}`}
      onClick={onClick} // Apply onClick to the root div
    >
      {title && (
        <div className={`p-4 sm:p-5 border-b border-[var(--color-border-light)] flex justify-between items-center`}>
          <h3 className={`font-poppins text-lg font-semibold text-[var(--color-primary)] ${titleClassName}`}>
            {title}
          </h3>
          {headerContent}
        </div>
      )}
      <div className={`${contentPaddingClass}`}>
        {children}
      </div>
    </div>
  );
};