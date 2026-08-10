import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = "md" }) {
    // Handle escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl'
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            ></div>
            
            {/* Modal Content */}
            <div className={`relative bg-white dark:bg-[#1C1C1A] w-full ${maxWidthClasses[maxWidth]} rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-800`}>
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 m-0">{title}</h2>
                    <button 
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "Ya, Lanjutkan", cancelText = "Batal", isDestructive = false, isLoading = false }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
            <div className="flex flex-col items-center text-center gap-4 py-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-500' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-500'}`}>
                    <AlertTriangle size={24} />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed m-0">{message}</p>
                
                <div className="flex w-full gap-3 mt-4">
                    <button 
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                            isDestructive 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
