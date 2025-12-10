'use client';

import React from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';

import { AlertTriangle, Check, HelpCircle, Info } from 'lucide-react';

// Types
type ConfirmType = 'danger' | 'warning' | 'info' | 'success' | 'question';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: ConfirmType;
    destructive?: boolean;
}

// Icon mapping
const getIcon = (type: ConfirmType) => {
    switch (type) {
        case 'danger':
            return <AlertTriangle className='h-6 w-6 text-red-500' />;
        case 'warning':
            return <AlertTriangle className='h-6 w-6 text-yellow-500' />;
        case 'success':
            return <Check className='h-6 w-6 text-green-500' />;
        case 'info':
            return <Info className='h-6 w-6 text-blue-500' />;
        case 'question':
            return <HelpCircle className='h-6 w-6 text-purple-500' />;
        default:
            return <HelpCircle className='h-6 w-6 text-gray-500' />;
    }
};

// Color mapping
const getColors = (type: ConfirmType) => {
    switch (type) {
        case 'danger':
            return {
                headerBg: 'bg-red-50 dark:bg-red-950/20',
                border: 'border-red-200 dark:border-red-800',
                confirmBtn: 'bg-red-600 hover:bg-red-700 text-white'
            };
        case 'warning':
            return {
                headerBg: 'bg-yellow-50 dark:bg-yellow-950/20',
                border: 'border-yellow-200 dark:border-yellow-800',
                confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 text-white'
            };
        case 'success':
            return {
                headerBg: 'bg-green-50 dark:bg-green-950/20',
                border: 'border-green-200 dark:border-green-800',
                confirmBtn: 'bg-green-600 hover:bg-green-700 text-white'
            };
        case 'info':
            return {
                headerBg: 'bg-blue-50 dark:bg-blue-950/20',
                border: 'border-blue-200 dark:border-blue-800',
                confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white'
            };
        case 'question':
            return {
                headerBg: 'bg-purple-50 dark:bg-purple-950/20',
                border: 'border-purple-200 dark:border-purple-800',
                confirmBtn: 'bg-purple-600 hover:bg-purple-700 text-white'
            };
        default:
            return {
                headerBg: 'bg-gray-50 dark:bg-gray-950/20',
                border: 'border-gray-200 dark:border-gray-800',
                confirmBtn: 'bg-gray-600 hover:bg-gray-700 text-white'
            };
    }
};

// Main Component
const CustomConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'question',
    destructive = false
}) => {
    const colors = getColors(type);
    const icon = getIcon(type);

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleClose = () => {
        // Force cleanup any overlay remnants
        setTimeout(() => {
            document.body.style.pointerEvents = '';
            document.body.style.overflow = '';

            // Remove any lingering backdrop elements
            const backdrops = document.querySelectorAll('[data-radix-dialog-overlay]');
            backdrops.forEach((backdrop) => {
                if (backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                }
            });
        }, 100);

        onClose();
    };

    const confirmButtonClass = destructive
        ? 'min-w-[100px] bg-red-600 hover:bg-red-700 text-white'
        : `min-w-[100px] ${colors.confirmBtn}`;

    return (
        <AlertDialog open={isOpen} onOpenChange={handleClose}>
            <AlertDialogContent
                className='sm:max-w-md'
                // ✅ Remove onInteractOutside - not supported
                // ✅ Keep only supported props
                onEscapeKeyDown={handleClose}
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 9999
                }}>
                {/* Header with Icon */}
                <AlertDialogHeader
                    className={`${colors.headerBg} ${colors.border} -mx-6 -mt-6 mb-4 rounded-t-lg border px-6 py-4`}>
                    <div className='flex items-center space-x-3'>
                        {icon}
                        <AlertDialogTitle className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                            {title}
                        </AlertDialogTitle>
                    </div>
                </AlertDialogHeader>

                {/* Description */}
                <AlertDialogDescription className='text-base leading-relaxed text-gray-600 dark:text-gray-300'>
                    {description}
                </AlertDialogDescription>

                {/* Footer */}
                <AlertDialogFooter className='gap-3 pt-6'>
                    <AlertDialogCancel
                        onClick={handleClose}
                        className='min-w-[100px] border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800'>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm} className={confirmButtonClass}>
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default CustomConfirmDialog;
