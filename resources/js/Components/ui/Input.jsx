import React from 'react';

export default function Input({ 
    label, 
    id, 
    error, 
    className = '', 
    ...props 
}) {
    return (
        <div className={`form-group ${className}`}>
            {label && <label htmlFor={id}>{label}</label>}
            <input 
                id={id}
                className={`form-control ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                {...props}
            />
            {error && <span className="text-red-500 text-xs font-medium mt-1">{error}</span>}
        </div>
    );
}
