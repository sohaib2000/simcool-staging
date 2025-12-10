import { useTranslation } from '@/contexts/LanguageContext';
import { LANGUAGES } from '@/data/languages';

export default function MobileLanguageSelector({ setIsMobileOpen }: { setIsMobileOpen: (isOpen: boolean) => void }) {
    const { selectedLanguage, setSelectedLanguage } = useTranslation();

    return (
        <div className='border-t border-gray-100 pt-4'>
            <p className='mb-3 px-3 text-sm font-medium text-gray-800'>Language</p>
            <div className='grid grid-cols-2 gap-2'>
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        type='button'
                        onClick={() => {
                            setSelectedLanguage(lang.code);
                            setIsMobileOpen(false);
                        }}
                        className={`rounded-lg p-3 text-sm transition-colors ${
                            selectedLanguage === lang.code
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}>
                        {lang.nativeName}
                    </button>
                ))}
            </div>
        </div>
    );
}
