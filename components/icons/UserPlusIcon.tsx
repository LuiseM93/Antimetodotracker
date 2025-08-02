import React from 'react';

interface UserPlusIconProps extends React.SVGProps<SVGSVGElement> {
  filled?: boolean;
}

export const UserPlusIcon: React.FC<UserPlusIconProps> = ({ filled = false, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill={filled ? "currentColor" : "none"}
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-6-3a9 9 0 1 1 18 0 9 9 0 0 1-18 0ZM6 12h.01"
    />
  </svg>
);
