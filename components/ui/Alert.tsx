import React, { ReactNode } from 'react';

interface AlertProps {
  variant?: 'error' | 'success' | 'info';
  title?: string;
  children: ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  variant = 'info', 
  title, 
  children,
  className = '' 
}) => {
  const styles = {
    error: 'bg-error-container text-on-error-container border-error-container',
    success: 'bg-secondary-container text-on-secondary-container border-secondary-container',
    info: 'bg-primary-container text-on-primary-container border-primary-container',
  };

  const icons = {
    error: 'error',
    success: 'check_circle',
    info: 'info',
  };

  return (
    <div className={`p-md rounded border flex gap-sm items-start ${styles[variant]} ${className}`}>
      <span className="material-symbols-outlined text-[20px] mt-0.5">
        {icons[variant]}
      </span>
      <div className="flex flex-col gap-xs">
        {title && <span className="font-bold text-body-md">{title}</span>}
        <div className="text-body-sm opacity-90">{children}</div>
      </div>
    </div>
  );
};

export default Alert;
