
import React from 'react';

interface IconProps {
  className?: string;
}

export const GiftIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25c2.494.04 4.495 2.053 4.495 4.545 0 2.492-2.001 4.505-4.495 4.545V16.5m-4.5-9.75v10.5m0-10.5c-2.494.04-4.495 2.053-4.495 4.545C3.005 12.337 5.006 14.35 7.5 14.394V3M12 21a2.25 2.25 0 002.25-2.25H9.75A2.25 2.25 0 0012 21z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.005 9.845A5.969 5.969 0 012.25 6.75a8.25 8.25 0 0119.5 0c0 1.637-.417 3.168-1.151 4.5H3.005zM2.25 6.75h19.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5a4.474 4.474 0 002.686-1.006M12 16.5a4.474 4.474 0 01-2.686-1.006" />
  </svg>
);
