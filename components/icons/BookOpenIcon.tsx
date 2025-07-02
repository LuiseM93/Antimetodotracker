
import React from 'react';

interface IconProps {
  className?: string;
}

// A more generic book/learning icon
export const BookOpenIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25V18.5" /> 
    {/* Minor change for a slightly different look if needed, or keep original. Original: M0-14.25v14.25 */}
    {/* Adding a small element to make it slightly different if it's used as placeholder */}
     <path strokeLinecap="round" strokeLinejoin="round" d="M15 6.75h3M15 9.75h3" />
  </svg>
);
