'use client';

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import ar from '@/lib/locales/ar.json';
// Import your translation files
import en from '@/lib/locales/en.json';
import es from '@/lib/locales/es.json';
import fr from '@/lib/locales/fr.json';
import hi from '@/lib/locales/hi.json';
import id from '@/lib/locales/id.json';
import zh from '@/lib/locales/zh.json';

type Locale = 'EN' | 'HI' | 'ES' | 'FR' | 'AR' | 'ZH' | 'ID';

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    selectedLanguage: Locale;
    setSelectedLanguage: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    formatDate: (date: Date) => string;
    formatNumber: (number: number) => string;
    formatCurrency: (amount: number, currency?: string) => string;
    isClient: boolean; // Add this to track client-side mount
}

const translations = {
    EN: en,
    HI: hi,
    ES: es,
    FR: fr,
    AR: ar,
    ZH: zh,
    ID: id
};

const localeMapping = {
    EN: 'en-US',
    HI: 'hi-IN',
    ES: 'es-ES',
    FR: 'fr-FR',
    AR: 'ar-SA',
    ZH: 'zh-CN',
    ID: 'id-ID'
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to safely access localStorage
const getStoredLanguage = (): Locale | null => {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem('selectedLanguage') as Locale;
    } catch {
        return null;
    }
};

// Helper function to safely store language
const storeLanguage = (language: Locale): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('selectedLanguage', language);
    } catch {
        // Handle storage errors gracefully
    }
};

// Helper function to detect browser language
const detectBrowserLanguage = (): Locale => {
    if (typeof window === 'undefined') return 'EN';

    const browserLang = navigator.language.toLowerCase();
    if (browserLang.includes('hi') || browserLang.includes('in')) {
        return 'HI';
    } else if (browserLang.includes('es')) {
        return 'ES';
    } else if (browserLang.includes('fr')) {
        return 'FR';
    }
    return 'EN';
};

export function LanguageProvider({ children }: Readonly<{ children: ReactNode }>) {
    const [selectedLanguage, setSelectedLanguage] = useState<Locale>('EN');
    const [isClient, setIsClient] = useState(false);

    // Initialize language on client mount
    useEffect(() => {
        setIsClient(true);

        const savedLocale = getStoredLanguage();
        if (savedLocale && translations[savedLocale]) {
            setSelectedLanguage(savedLocale);
        } else {
            const detectedLanguage = detectBrowserLanguage();
            setSelectedLanguage(detectedLanguage);
        }
    }, []);

    // Update storage and document language when language changes
    useEffect(() => {
        if (!isClient) return;

        storeLanguage(selectedLanguage);
        document.documentElement.lang = localeMapping[selectedLanguage];
    }, [selectedLanguage, isClient]);

    const t = (key: string, params?: Record<string, string | number>): string => {
        const keys = key.split('.');
        let value: any = translations[selectedLanguage];

        for (const k of keys) {
            value = value?.[k];
        }

        if (typeof value !== 'string') {
            console.warn(
                `Translation key "${key}" not found for locale "${selectedLanguage}", falling back to English`
            );
            let fallbackValue: any = translations['EN'];
            for (const k of keys) {
                fallbackValue = fallbackValue?.[k];
            }
            value = fallbackValue;
        }

        if (typeof value !== 'string') {
            console.warn(`Translation key "${key}" not found in any locale`);
            return key;
        }

        if (params) {
            return value.replace(/\{(\w+)\}/g, (match: string, paramKey: string) => {
                return params[paramKey]?.toString() || match;
            });
        }

        return value;
    };

    const formatDate = (date: Date): string => {
        if (!isClient) return date.toLocaleDateString(); // Fallback for SSR
        return new Intl.DateTimeFormat(localeMapping[selectedLanguage]).format(date);
    };

    const formatNumber = (number: number): string => {
        if (!isClient) return number.toString(); // Fallback for SSR
        return new Intl.NumberFormat(localeMapping[selectedLanguage]).format(number);
    };

    const formatCurrency = (amount: number, currency: string = 'USD'): string => {
        if (!isClient) return `${currency} ${amount}`; // Fallback for SSR

        const defaultCurrencies = {
            EN: 'USD',
            HI: 'INR',
            ES: 'EUR',
            FR: 'EUR',
            AR: 'SAR',
            ZH: 'CNY',
            ID: 'IDR'
        };

        const currencyToUse = currency === 'USD' ? defaultCurrencies[selectedLanguage] : currency;

        return new Intl.NumberFormat(localeMapping[selectedLanguage], {
            style: 'currency',
            currency: currencyToUse
        }).format(amount);
    };

    return (
        <LanguageContext.Provider
            value={{
                locale: selectedLanguage,
                setLocale: setSelectedLanguage,
                selectedLanguage,
                setSelectedLanguage,
                t,
                formatDate,
                formatNumber,
                formatCurrency,
                isClient
            }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
}

// Keep your existing convenience hooks
export function useCommonTranslations() {
    const { t } = useTranslation();
    return {
        title: t('common.title'),
        loading: t('common.loading'),
        error: t('common.error'),
        success: t('common.success'),
        welcome: t('common.welcome'),
        language: t('common.language')
    };
}

export function useNavigationTranslations() {
    const { t } = useTranslation();
    return {
        home: t('navigation.home'),
        about: t('navigation.about'),
        contact: t('navigation.contact'),
        services: t('navigation.services'),
        pricing: t('navigation.pricing'),
        blog: t('navigation.blog'),
        help: t('navigation.help'),
        documentation: t('navigation.documentation'),
        profile: t('navigation.profile'),
        login: t('navigation.login'),
        logout: t('navigation.logout')
    };
}

export function useButtonTranslations() {
    const { t } = useTranslation();
    return {
        submit: t('buttons.submit'),
        cancel: t('buttons.cancel'),
        save: t('buttons.save'),
        delete: t('buttons.delete'),
        edit: t('buttons.edit'),
        back: t('buttons.back'),
        next: t('buttons.next'),
        learn_more: t('buttons.learn_more'),
        get_started: t('buttons.get_started'),
        contact_us: t('buttons.contact_us')
    };
}

export function useFormTranslations() {
    const { t } = useTranslation();
    return {
        name: t('forms.name'),
        email: t('forms.email'),
        phone: t('forms.phone'),
        message: t('forms.message'),
        subject: t('forms.subject'),
        required: t('forms.required'),
        invalid_email: t('forms.invalid_email')
    };
}
