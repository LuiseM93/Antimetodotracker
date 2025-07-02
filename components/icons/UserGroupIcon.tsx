
import React from 'react';

interface IconProps {
  className?: string;
}

export const UserGroupIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.512 2.72a3 3 0 01-4.682-2.72 9.094 9.094 0 013.741-.479m7.512 2.72a8.97 8.97 0 01-7.512 0m7.512 2.72v-3.375c0-.621-.504-1.125-1.125-1.125h-3.75c-.621 0-1.125.504-1.125 1.125v3.375m0 0a3 3 0 00-3 3h12a3 3 0 00-3-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a3 3 0 11-6 0 3 3 0 016 0zM15.75 6a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
