'use client';

import { persistor, store } from '@/redux/store/store';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

interface ReduxProviderProps {
    children: React.ReactNode;
}

export function ReduxProvider({ children }: Readonly<ReduxProviderProps>) {
    if (!persistor) {
        return <Provider store={store}>{children}</Provider>;
    }
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    );
}
