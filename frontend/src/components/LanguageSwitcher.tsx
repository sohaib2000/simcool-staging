import { useEffect, useRef, useState } from 'react';

import { useTranslation } from '@/contexts/LanguageContext';
import { LANGUAGES } from '@/data/languages';

import { ChevronDown, Globe } from 'lucide-react';

export default function LanguageSwitcher({ colorLogic }: Readonly<{ colorLogic?: string }>) {
    const { selectedLanguage, setSelectedLanguage, isClient } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isClient) {
        return (
            <div className='relative'>
                <button className='flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/80'>
                    <Globe className='h-4 w-4' />
                    <span className='hidden sm:block'>EN</span>
                    <ChevronDown className='h-3 w-3' />
                </button>
            </div>
        );
    }

    const currentLanguage = LANGUAGES.find((lang) => lang.code === selectedLanguage);

    return (
        <div className='relative' ref={dropdownRef}>
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${colorLogic}`}
                aria-label='Select language'
                aria-expanded={isOpen}>
                <Globe className='h-4 w-4' />
                <span className='hidden sm:block'>{currentLanguage?.code}</span>
                <span className='text-lg sm:hidden'>{currentLanguage?.flag}</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    className='animate-in fade-in-0 zoom-in-95 absolute top-full right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg'
                    role='menu'>
                    <div className='border-b border-gray-100 px-3 py-2 text-xs font-semibold tracking-wide text-gray-500 uppercase'>
                        Select Language
                    </div>
                    <div className='py-1'>
                        {LANGUAGES.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setSelectedLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                role='menuitem'
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 ${
                                    selectedLanguage === lang.code
                                        ? 'bg-blue-50 font-medium text-blue-700'
                                        : 'text-gray-700'
                                }`}>
                                <span className='text-lg'>{lang.flag}</span>
                                <div className='flex-1'>
                                    <div className='font-medium'>{lang.nativeName}</div>
                                    <div className='text-xs text-gray-500'>{lang.name}</div>
                                </div>
                                {selectedLanguage === lang.code && <div className='h-2 w-2 rounded-full bg-blue-600' />}
                            </button>
                        ))}
                    </div>
                    <div className='border-t border-gray-100 px-3 py-2 text-xs text-gray-400'>
                        Changes are saved automatically
                    </div>
                </div>
            )}
        </div>
    );
}
