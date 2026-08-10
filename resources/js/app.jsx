import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './AuthContext';
import AppRoutes from './AppRoutes';

const el = document.getElementById('root');
const root = createRoot(el);

root.render(
    <React.StrictMode>
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    </React.StrictMode>
);
