import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  count?: number; // Number of skeleton lines/blocks to render
  height?: string; // Height of each skeleton line/block
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  count = 1,
  height = 'h-4',
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`animate-pulse bg-[var(--color-light-purple)] rounded-md ${height} ${className}`}
    ></div>
  ));

  return <>{skeletons}</>;
};
