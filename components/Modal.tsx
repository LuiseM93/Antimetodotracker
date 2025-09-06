
import React, { useEffect } from 'react';
import { XMarkIcon } from './icons/XMarkIcon.tsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footerContent?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  footerContent 
}) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let sizeClasses = '';
  switch (size) {
    case 'sm': sizeClasses = 'max-w-sm'; break;
    case 'md': sizeClasses = 'max-w-md'; break;
    case 'lg': sizeClasses = 'max-w-lg'; break;
    case 'xl': sizeClasses = 'max-w-xl'; break;
    case 'full': sizeClasses = 'max-w-full h-full'; break;
    default: sizeClasses = 'max-w-md';
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
    >
      <div
        className={`bg-[var(--color-card-bg)] rounded-lg shadow-xl w-full ${sizeClasses} flex flex-col max-h-[90vh] ${size === 'full' ? 'h-full' : ''}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
      >
        <div className={`flex items-center justify-between p-4 border-b border-[var(--color-light-purple)]`}>
          {title && <h2 className={`text-xl font-poppins font-semibold text-[var(--color-primary)]`}>{title}</h2>}
          <button
            onClick={onClose}
            className={`text-[var(--color-text-light)] hover:text-[var(--color-accent)] transition-colors`}
            aria-label="Cerrar modal"
            title="Cerrar modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          {children}
        </div>
        {footerContent && (
          <div className={`p-4 border-t border-[var(--color-light-purple)]`}>
            {footerContent}
          </div>
        )}
      </div>
    </div>
  );
};