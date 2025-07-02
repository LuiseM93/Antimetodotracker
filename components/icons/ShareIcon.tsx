
import React from 'react';

interface IconProps {
  className?: string;
}

export const ShareIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.042.586.042h1.494a.75.75 0 00.725-.976 48.077 48.077 0 00-1.048-3.41A2.25 2.25 0 0010.5 5.25v1.458c0 .31.119.603.33.824l1.491 1.492a2.25 2.25 0 01-.042 3.586m-.042-3.586C12.182 10.025 12 9.771 12 9.508V7.932A2.25 2.25 0 0113.682 6c.594 0 1.147.245 1.543.655a48.077 48.077 0 011.048 3.41.75.75 0 01-.725.976h-1.494a2.25 2.25 0 00-2.006 1.348M15 13.5a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zm0 0v-1.636c0-.263.096-.511.264-.702l1.491-1.492a2.25 2.25 0 013.182 0l1.491 1.492c.168.191.264.44.264.702v1.636m0 0V15a2.25 2.25 0 01-2.25 2.25H15a2.25 2.25 0 01-2.25-2.25V13.5m0 0h-2.25" />
  </svg>
);
