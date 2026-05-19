import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'lg' }) => {
  const paddings = {
    none: '',
    sm: 'p-sm',
    md: 'p-md',
    lg: 'p-lg',
  };

  return (
    <div className={`bg-surface-container-lowest rounded-lg shadow-level-1 ${paddings[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
