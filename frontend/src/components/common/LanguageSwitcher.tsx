import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GlobeAltIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface Language {
  code: string;
  labelKey: string;
}

const languages: Language[] = [
  { code: 'vi', labelKey: 'common.vietnamese' },
  { code: 'en', labelKey: 'common.english' },
];

interface LanguageSwitcherProps {
  variant?: 'desktop' | 'mobile';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'desktop' }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const currentLanguage = i18n.language || 'vi';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_language', lng);
    }
    setIsOpen(false);
  };

  const containerClasses =
    variant === 'desktop'
      ? 'relative inline-block text-left'
      : 'relative inline-block text-left w-full';

  const buttonClasses =
    variant === 'desktop'
      ? 'flex items-center space-x-2 px-3 py-2 border border-slate-700 rounded-none text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors'
      : 'flex items-center justify-between w-full px-4 py-3 border border-gray-200 rounded-md text-sm text-gray-700 bg-white';

  const menuClasses =
    variant === 'desktop'
      ? 'absolute right-0 mt-1 w-40 bg-white rounded-none shadow-lg border border-stone-200 z-50'
      : 'absolute right-0 left-0 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 z-50';

  return (
    <div className={containerClasses} ref={switcherRef}>
      <button
        type="button"
        className={buttonClasses}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="flex items-center space-x-2">
          <GlobeAltIcon className="h-4 w-4" />
          <span className="font-medium">
            {t('common.language')}: {t(languages.find((lang) => lang.code === currentLanguage)?.labelKey ?? 'common.vietnamese')}
          </span>
        </span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className={menuClasses}>
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                type="button"
                className={`w-full text-left px-4 py-2 text-sm ${
                  currentLanguage === language.code
                    ? 'bg-stone-100 text-slate-900 font-semibold'
                    : 'text-gray-700 hover:bg-stone-50 hover:text-slate-900'
                }`}
                onClick={() => changeLanguage(language.code)}
              >
                {t(language.labelKey)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;


