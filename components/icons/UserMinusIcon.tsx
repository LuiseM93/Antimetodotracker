import React from 'react';

interface UserMinusIconProps extends React.SVGProps<SVGSVGElement> {
  filled?: boolean;
}

export const UserMinusIcon: React.FC<UserMinusIconProps> = ({ filled = false, ...props }) => (
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
      d="M18 12H6M12 6v.01M12 18v.01M12 12a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z"
    />
  </svg>
);
