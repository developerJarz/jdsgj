import React, { useEffect } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  width = 'lg',
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widthClass = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }[width];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen ${widthClass} bg-white shadow-2xl flex flex-col z-10 border-l border-gray-100 transform transition-transform duration-200`}
        >
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
