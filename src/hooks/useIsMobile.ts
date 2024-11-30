import { useState, useEffect } from 'react';

export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            const userAgent = navigator.userAgent.toLowerCase();
            return /iphone|ipad|ipod|android/.test(userAgent);
        };

        setIsMobile(checkIsMobile());
    }, []);

    return isMobile;
};