import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'positive' | 'alert';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', isLoading = false, className = '', disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded px-lg py-sm transition-colors text-label-caps focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container',
      secondary: 'bg-transparent border border-primary text-primary hover:bg-primary/5',
      positive: 'bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container',
      alert: 'bg-error text-on-error hover:bg-error-container hover:text-on-error-container',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="material-symbols-outlined animate-loader mr-sm text-sm">
            progress_activity
          </span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
