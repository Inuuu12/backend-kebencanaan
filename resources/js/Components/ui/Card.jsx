import React from 'react';

export default function Card({ 
    children, 
    className = '', 
    accent, // banjir, kebakaran, longsor, puting-beliung, gempa
    ...props 
}) {
    let cardClass = 'panel-card';
    if (accent) {
        cardClass += ` border-accent-${accent}`;
    }
    
    return (
        <div className={`${cardClass} ${className}`} {...props}>
            {children}
        </div>
    );
}
