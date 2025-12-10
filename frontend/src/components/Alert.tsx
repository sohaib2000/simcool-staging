'use client';

import React, { useEffect, useState } from 'react';

import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';

interface AlertProps {
    message: string;
    onClose: () => void;
    duration?: number;
    type?: 'success' | 'error' | 'warning' | 'info';
    className?: string;
}

const Alert = ({ message, onClose, duration = 4000, type = 'info', className = '' }: AlertProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Show animation
        const showTimer = setTimeout(() => setIsVisible(true), 10);

        const hideTimer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const alertConfig = {
        success: {
            colors: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-100',
            icon: <CheckCircle className='h-5 w-5' />,
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            progressColor: 'bg-emerald-500'
        },
        error: {
            colors: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800/50 text-red-900 dark:text-red-100',
            icon: <XCircle className='h-5 w-5' />,
            iconColor: 'text-red-600 dark:text-red-400',
            progressColor: 'bg-red-500'
        },
        warning: {
            colors: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-100',
            icon: <AlertTriangle className='h-5 w-5' />,
            iconColor: 'text-amber-600 dark:text-amber-400',
            progressColor: 'bg-amber-500'
        },
        info: {
            colors: 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/50 text-sky-900 dark:text-sky-100',
            icon: <Info className='h-5 w-5' />,
            iconColor: 'text-sky-600 dark:text-sky-400',
            progressColor: 'bg-sky-500'
        }
    };

    const config = alertConfig[type];

    return (
        <div
            className={`fixed top-4 right-4 z-[999] w-full max-w-sm transition-all duration-300 ease-out ${className} ${
                isVisible && !isExiting
                    ? 'translate-x-0 scale-100 transform opacity-100'
                    : 'translate-x-full scale-95 transform opacity-0'
            }`}>
            <div
                className={`${config.colors} group relative flex items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg backdrop-blur-sm`}
                role='alert'
                aria-live='polite'>
                {/* Animated Progress Bar */}
                <div className='absolute bottom-0 left-0 h-0.5 w-full bg-black/5 dark:bg-white/5'>
                    <div
                        className={`h-full ${config.progressColor} transition-all ease-linear`}
                        style={{
                            width: isVisible && !isExiting ? '0%' : '100%',
                            transitionDuration: `${duration}ms`
                        }}
                    />
                </div>

                {/* Icon with pulse animation */}
                <div className={`flex-shrink-0 ${config.iconColor} animate-pulse`}>{config.icon}</div>

                {/* Message */}
                <div className='min-w-0 flex-1 pr-2'>
                    <p className='text-sm leading-5 font-medium break-words'>{message}</p>
                </div>

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className='focus:ring-opacity-30 flex-shrink-0 rounded-lg p-1 opacity-60 transition-all duration-200 group-hover:opacity-100 hover:bg-black/10 hover:opacity-100 focus:ring-2 focus:ring-current focus:outline-none dark:hover:bg-white/10'
                    aria-label='Dismiss notification'>
                    <X className='h-4 w-4' />
                </button>
            </div>
        </div>
    );
};

export default Alert;
