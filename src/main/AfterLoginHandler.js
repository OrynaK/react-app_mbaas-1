import React, { useEffect } from 'react';
import Backendless from 'backendless';

const AfterLoginEventHandler = () => {
    useEffect(() => {
        const handleAfterLogin = async () => {
            try {
                const currentUser = await Backendless.UserService.getCurrentUser();
                console.log('User logged in:', currentUser);
            } catch (error) {
                console.error('Error handling after login event:', error);
            }
        };

        Backendless.UserService.addLoginEventDispatcher(handleAfterLogin);

        return () => {
            Backendless.UserService.removeLoginEventDispatcher(handleAfterLogin);
        };
    }, []);

    return null;
};

export default AfterLoginEventHandler;
