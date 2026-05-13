import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md sm:p-lg">
      <div 
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative z-10 w-full max-w-lg shadow-level-2 bg-surface-container-lowest rounded-lg flex flex-col max-h-[90vh]">
        {title && (
          <div className="flex items-center justify-between p-lg border-b border-surface-variant">
            <h2 className="text-h3 text-on-surface">{title}</h2>
            <button 
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}
        
        <div className="p-lg overflow-y-auto">
          {children}
        </div>

        {footer && (
          <div className="p-lg border-t border-surface-variant flex justify-end gap-md">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;

  return createPortal(modalContent, document.body);
};

export default Modal;
