import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

const TestComponent = () => {
  const { locale, dir, setLocale, isRTL } = useLocale();
  
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="dir">{dir}</span>
      <span data-testid="isRTL">{isRTL.toString()}</span>
      <button onClick={() => setLocale('ar')}>Set Arabic</button>
      <button onClick={() => setLocale('en')}>Set English</button>
    </div>
  );
};

describe('LocaleContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('defaults to English locale', () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('dir')).toHaveTextContent('ltr');
    expect(screen.getByTestId('isRTL')).toHaveTextContent('false');
  });

  it('switches to Arabic and sets RTL', () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    fireEvent.click(screen.getByText('Set Arabic'));

    expect(screen.getByTestId('locale')).toHaveTextContent('ar');
    expect(screen.getByTestId('dir')).toHaveTextContent('rtl');
    expect(screen.getByTestId('isRTL')).toHaveTextContent('true');
  });

  it('persists locale to localStorage', () => {
    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    fireEvent.click(screen.getByText('Set Arabic'));

    expect(localStorage.getItem('feasly-locale')).toBe('ar');
  });

  it('restores locale from localStorage', () => {
    localStorage.setItem('feasly-locale', 'ar');

    render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    expect(screen.getByTestId('locale')).toHaveTextContent('ar');
    expect(screen.getByTestId('dir')).toHaveTextContent('rtl');
  });
});