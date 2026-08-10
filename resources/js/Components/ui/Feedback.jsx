import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, RefreshCcw, CheckCircle2, X } from 'lucide-react';

export function PageLoader({ message = "Memuat data..." }) {
    return (
        <div className="flex flex-col items-center justify-center flex-grow min-h-[300px] w-full gap-3 opacity-70">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <span className="text-gray-500 font-medium text-sm">{message}</span>
        </div>
    );
}

export function EmptyState({ icon: Icon, title = "Tidak ada data", message = "Belum ada data yang tersedia saat ini.", action }) {
    return (
        <div className="flex flex-col items-center justify-center flex-grow min-h-[300px] w-full gap-3 text-center p-6 bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            {Icon && <Icon size={40} className="text-gray-300 dark:text-gray-600 mb-2" />}
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 m-0">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm m-0">{message}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

export function ErrorState({ title = "Terjadi Kesalahan", message = "Gagal memuat data. Silakan coba lagi.", onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center flex-grow min-h-[300px] w-full gap-3 text-center p-6 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-dashed border-red-200 dark:border-red-900/30">
            <AlertTriangle size={40} className="text-red-400 dark:text-red-600 mb-2" />
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 m-0">{title}</h3>
            <p className="text-sm text-red-600 dark:text-red-300/80 max-w-sm m-0">{message}</p>
            {onRetry && (
                <button 
                    onClick={onRetry}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
                >
                    <RefreshCcw size={16} /> Coba Lagi
                </button>
            )}
        </div>
    );
}

export function Toast({ type = "success", message, onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => onClose(), 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-top-2 fade-in duration-300 z-50 ${
            type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-400' 
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400'
        }`}>
            {type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <span className="text-sm font-medium flex-grow">{message}</span>
            <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors">
                <X size={16} />
            </button>
        </div>
    );
}
