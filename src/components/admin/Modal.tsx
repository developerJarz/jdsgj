import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full ${maxWidthClass} rounded-2xl bg-white shadow-2xl border border-gray-100 p-6 z-10 transform transition-all animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="max-h-[80vh] overflow-y-auto pr-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
