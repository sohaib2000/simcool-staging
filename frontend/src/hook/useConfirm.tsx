'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import CustomConfirmDialog from '@/components/CustomConfirmDialog';

type ConfirmType = 'danger' | 'warning' | 'info' | 'success' | 'question';

interface ConfirmOptions {
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: ConfirmType;
    destructive?: boolean;

    onConfirm?: () => void;
    onCancel?: () => void;
}

interface ConfirmState extends ConfirmOptions {
    isOpen: boolean;
}

export const useConfirm = () => {
    const [confirmState, setConfirmState] = useState<ConfirmState>({
        isOpen: false,
        title: '',
        description: ''
    });

    const resolveRef = useRef<((value: boolean) => void) | null>(null);

    useEffect(() => {
        if (!confirmState.isOpen) {
            const timer = setTimeout(() => {
                document.querySelectorAll('[data-radix-dialog-overlay]').forEach((el) => {
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                });
                document.body.style.pointerEvents = '';
                document.body.style.overflow = '';
                document.body.classList.remove('modal-open');
                document.querySelectorAll('[data-radix-popper-content-wrapper]').forEach((el) => {
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                });
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [confirmState.isOpen]);

    // ✅ Promise-based confirm
    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            document.querySelectorAll('[data-radix-dialog-overlay]').forEach((el) => {
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            });

            resolveRef.current = resolve;
            setConfirmState({
                ...options,
                isOpen: true
            });
        });
    }, []);

    const showConfirm = useCallback((options: ConfirmOptions) => {
        document.querySelectorAll('[data-radix-dialog-overlay]').forEach((el) => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        });

        setConfirmState({
            ...options,
            isOpen: true
        });
    }, []);

    const handleConfirm = useCallback(() => {
        if (resolveRef.current) {
            resolveRef.current(true);
            resolveRef.current = null;
        }

        if (confirmState.onConfirm) {
            confirmState.onConfirm();
        }

        setConfirmState((prev) => ({ ...prev, isOpen: false }));
    }, [confirmState]);

    const handleCancel = useCallback(() => {
        if (resolveRef.current) {
            resolveRef.current(false);
            resolveRef.current = null;
        }

        if (confirmState.onCancel) {
            confirmState.onCancel();
        }

        setConfirmState((prev) => ({ ...prev, isOpen: false }));
    }, [confirmState]);

    const ConfirmDialog = useCallback(
        () => (
            <CustomConfirmDialog
                isOpen={confirmState.isOpen}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                title={confirmState.title}
                description={confirmState.description}
                confirmText={confirmState.confirmText}
                cancelText={confirmState.cancelText}
                type={confirmState.type}
                destructive={confirmState.destructive}
            />
        ),
        [confirmState, handleCancel, handleConfirm]
    );

    // ✅ Return both approaches
    return { confirm, showConfirm, ConfirmDialog };
};
