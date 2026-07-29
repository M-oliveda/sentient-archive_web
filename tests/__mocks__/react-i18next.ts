/**
 * Mock for react-i18next in tests
 *
 * Provides synchronous English translations for testing
 */

export const useTranslation = () => {
    return {
        t: (key: string) => key,
        i18n: {
            language: "en",
            changeLanguage: jest.fn().mockResolvedValue(undefined),
        },
    };
};

export const Trans = ({ children }: { children: React.ReactNode }) => children;

export const initReactI18next = {
    type: "3rdParty",
    init: jest.fn(),
};
