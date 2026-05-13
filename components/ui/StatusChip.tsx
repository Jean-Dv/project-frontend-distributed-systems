import React, { ReactNode } from 'react';

interface StatusChipProps {
  variant?: 'success' | 'alert' | 'warning' | 'default';
  children: ReactNode;
  icon?: string;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ 
  variant = 'default', 
  children, 
  icon,
  className = '' 
}) => {
  const variants = {
    success: 'bg-secondary-container text-on-secondary-container',
    alert: 'bg-error-container text-on-error-container',
    warning: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    default: 'bg-surface-container-highest text-on-surface-variant',
  };

  return (
    <span className={`inline-flex items-center gap-xs px-sm py-0.5 rounded-full text-label-caps ${variants[variant]} ${className}`}>
      {icon && (
        <span className="material-symbols-outlined text-[14px]">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
};

export default StatusChip;
