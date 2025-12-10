import { create } from 'zustand';

type AlertType = 'default' | 'destructive';

interface AlertState {
    title: string;
    description: string;
    variant?: AlertType;
    visible: boolean;
    showAlert: (options: { title: string; description: string; variant?: AlertType }) => void;
    hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
    title: '',
    description: '',
    variant: 'default',
    visible: false,
    showAlert: ({ title, description, variant = 'default' }) => set({ title, description, variant, visible: true }),
    hideAlert: () => set({ visible: false })
}));
