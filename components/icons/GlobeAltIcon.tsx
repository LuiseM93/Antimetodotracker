
import React from 'react';

interface IconProps {
  className?: string;
}

export const GlobeAltIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c1.355 0 2.707-.158 4.008-.462M12 21c-1.355 0-2.707-.158-4.008-.462m0 0a9.006 9.006 0 018.016 0M3.284 9.932a9.006 9.006 0 010-3.864m17.432 3.864a9.006 9.006 0 000-3.864M12 3c1.355 0 2.707.158 4.008.462M12 3c-1.355 0-2.707.158-4.008.462m0 0a9.006 9.006 0 00-8.016 0M20.716 9.932a9.006 9.006 0 000-3.864" />
    </svg>
);
