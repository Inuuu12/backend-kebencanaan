import { useState, useEffect, useCallback } from 'react';

// Basic hook pattern for GET requests
export function useApi(apiFunction, initialData = null) {
    const [data, setData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiFunction(...args);
            setData(response.data !== undefined ? response.data : response);
            return response;
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [apiFunction]);

    return { data, isLoading, error, execute, setData };
}

// Basic hook pattern for mutations (POST/PUT/DELETE)
export function useMutation(apiFunction) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const mutate = async (...args) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiFunction(...args);
            return response;
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { mutate, isLoading, error };
}
