
import React from 'react';

interface IconProps {
  className?: string;
}

export const PresentationChartLineIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5V7.5M10.5 19.5V7.5m6.75 12V7.5m-6.75 4.5l3-3m0 0l3 3m-3-3v12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v.008h.008V3H3.75zm3.75 0v.008h.008V3H7.5zm3.75 0v.008h.008V3h-.008zm3.75 0v.008h.008V3h-.008zM3.75 6v.008h.008V6H3.75zm3.75 0v.008h.008V6H7.5zm3.75 0v.008h.008V6h-.008zm3.75 0v.008h.008V6h-.008zM3.75 9v.008h.008V9H3.75zm3.75 0v.008h.008V9H7.5zm3.75 0v.008h.008V9h-.008zm3.75 0v.008h.008V9h-.008zm-15-6a1.125 1.125 0 011.125-1.125h15.75A1.125 1.125 0 0121 3v15.75A1.125 1.125 0 0119.875 21H3.125A1.125 1.125 0 012 19.875V3zm1.125 15.75h15.75M4.5 7.5l3 3 3-3" />
  </svg>
);
