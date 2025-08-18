import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    const { getByTestId } = render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    expect(getByTestId('locale')).toHaveTextContent('en');
    expect(getByTestId('dir')).toHaveTextContent('ltr');
    expect(getByTestId('isRTL')).toHaveTextContent('false');
  });

  it('switches to Arabic and sets RTL', async () => {
    const user = userEvent.setup();
    const { getByTestId, getByText } = render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    await user.click(getByText('Set Arabic'));

    expect(getByTestId('locale')).toHaveTextContent('ar');
    expect(getByTestId('dir')).toHaveTextContent('rtl');
    expect(getByTestId('isRTL')).toHaveTextContent('true');
  });

  it('persists locale to localStorage', async () => {
    const user = userEvent.setup();
    const { getByText } = render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    await user.click(getByText('Set Arabic'));

    expect(localStorage.getItem('feasly-locale')).toBe('ar');
  });

  it('restores locale from localStorage', () => {
    localStorage.setItem('feasly-locale', 'ar');

    const { getByTestId } = render(
      <LocaleProvider>
        <TestComponent />
      </LocaleProvider>
    );

    expect(getByTestId('locale')).toHaveTextContent('ar');
    expect(getByTestId('dir')).toHaveTextContent('rtl');
  });
});