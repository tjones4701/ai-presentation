'use client'
import React, { useEffect } from 'react';

const PageRefresher: React.FC<{ refreshInterval: number }> = ({ refreshInterval }) => {
    useEffect(() => {
        const intervalId = setInterval(() => {
            window.location.reload();
        }, refreshInterval * 1000);

        return () => clearInterval(intervalId);
    }, [refreshInterval]);

    return null;
};

export default PageRefresher;