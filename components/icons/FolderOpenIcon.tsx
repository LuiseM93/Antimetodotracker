
import React from 'react';

interface IconProps {
  className?: string;
}

export const FolderOpenIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0A2.25 2.25 0 015.25 7.5h13.5<a>2.25 2.25 0 012.25 2.25m-15.75 0v1.5A2.25 2.25 0 005.25 15h13.5A2.25 2.25 0 0021 12.75v-1.5m-15.75 0v-1.5A2.25 2.25 0 015.25 6h13.5A2.25 2.25 0 0121 8.25v1.5" />
  </svg>
);
