import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/Card.tsx';
import { ChevronDownIcon } from '../../components/icons/ChevronDownIcon.tsx';

interface FocusCardProps {
  title: string;
  objective: string;
  description: string;
}

export const FocusCard: React.FC<FocusCardProps> = ({ title, objective, description }) => {
    const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isExpanded, setIsExpanded] = useState(isDesktop);

  

  const variants = {
    open: { opacity: 1, height: 'auto' },
    closed: { opacity: 0, height: 0 },
  };

  return (
    <Card 
      title={title} 
      className={`bg-[var(--color-light-purple)] bg-opacity-30 border border-[var(--color-secondary)] overflow-hidden ${isExpanded ? '' : 'max-h-20'}`}
      titleClassName="cursor-pointer"
      onClick={() => {
        
        setIsExpanded(prev => {
          
          return !prev;
        });
      }}
      headerContent={
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDownIcon className="w-6 h-6 text-[var(--color-secondary)]" />
        </motion.div>
      }
      contentPaddingClass={isExpanded ? 'p-4 sm:p-5' : 'p-0'}
    >
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <p className={`text-lg font-semibold text-[var(--color-secondary)] mb-1`}>{objective}</p>
              <p className={`text-sm text-[var(--color-text-main)]`}>{description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};