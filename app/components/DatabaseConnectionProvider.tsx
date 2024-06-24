'use client'
import {useState, useEffect, ReactNode} from 'react';
import { toast } from 'react-toastify';

interface DatabaseConnectionProviderProps {
    children : ReactNode;
}

export default function DatabaseConnectionProvider({children} : DatabaseConnectionProviderProps) {
    const [dbConnected,
        setDbConnected] = useState(false);

    useEffect(() => {
        const connectToDatabase = async() => {
            try {
                const response = await fetch('/api/connect');
                if (response.ok) {
                    setDbConnected(true);
                    toast.success('Sucessfully connected to the database');
                } else {
                    throw new Error('Failed to connect to the database');
                    toast.error('Failed to connect to the database');
                    
                }
            } catch (error) {
                console.error(error);
            }
        };

        connectToDatabase();
    }, []);

    if (!dbConnected) {
        return (
            <div className="flex items-center justify-center h-screen w-screen">
                <span className="loading loading-spinner text-primary"></span>
                <span className="loading loading-spinner text-secondary"></span>
                <span className="loading loading-spinner text-accent"></span>
                <span className="loading loading-spinner text-neutral"></span>
                <span className="loading loading-spinner text-info"></span>
                <span className="loading loading-spinner text-success"></span>
                <span className="loading loading-spinner text-warning"></span>
                <span className="loading loading-spinner text-error"></span>
            </div>
        );
    }

    return <> {children} </>;
}