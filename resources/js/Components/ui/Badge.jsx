import React from 'react';

export default function Badge({ 
    children, 
    status, // pending, verified, handling, resolved, rejected
    priority, // low, medium, high, critical
    className = '' 
}) {
    let badgeClass = 'badge';
    let hasDot = false;

    if (status) {
        badgeClass += ` badge-status-${status}`;
        hasDot = true;
    } else if (priority) {
        badgeClass += ` badge-priority-${priority}`;
        hasDot = true;
    } else {
        // default styling
        badgeClass += ' bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }

    return (
        <span className={`${badgeClass} ${className}`}>
            {hasDot && <span className="badge-dot"></span>}
            {children}
        </span>
    );
}
