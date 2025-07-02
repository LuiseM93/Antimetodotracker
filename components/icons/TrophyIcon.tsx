
import React from 'react';

interface IconProps {
  className?: string;
}

export const TrophyIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497M12 15.75v-3.75m0 0h3.375M12 12h-3.375M12 12V6.375m0-3v-.375A3.375 3.375 0 0115.375 3h.001M12 3.375A3.375 3.375 0 008.625 3h-.001M12 3.375v.002" />
  </svg>
);
