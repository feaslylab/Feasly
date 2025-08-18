import { describe, it, expect } from 'vitest';
import { fmtNumber, fmtFinance, fmtCurrency, fmtPercentage } from '@/lib/number';

describe('number formatting', () => {
  describe('fmtNumber', () => {
    it('formats numbers in English locale', () => {
      expect(fmtNumber(1234.56, 'en')).toBe('1,234.56');
      expect(fmtNumber(1000000, 'en')).toBe('1,000,000');
    });

    it('formats numbers in Arabic locale', () => {
      expect(fmtNumber(1234.56, 'ar')).toBe('١٬٢٣٤٫٥٦');
    });
  });

  describe('fmtFinance', () => {
    it('uses Western numerals for both EN and AR (policy decision)', () => {
      expect(fmtFinance(1234.56, 'en')).toBe('1,234.56');
      expect(fmtFinance(1234.56, 'ar')).toBe('1,234.56'); // Western numerals for readability
    });
  });

  describe('fmtCurrency', () => {
    it('formats currency in English', () => {
      expect(fmtCurrency(1234567, 'en')).toBe('$1,234,567');
    });

    it('formats currency in Arabic with Western numerals', () => {
      expect(fmtCurrency(1234567, 'ar')).toBe('$1,234,567');
    });
  });

  describe('fmtPercentage', () => {
    it('formats percentages correctly', () => {
      expect(fmtPercentage(12.5, 'en')).toBe('12.5%');
      expect(fmtPercentage(12.5, 'ar')).toBe('12.5%'); // Western numerals
    });
  });
});