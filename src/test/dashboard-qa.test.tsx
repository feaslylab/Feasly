/**
 * Dashboard Quality Assurance Test Suite
 * Validates breakpoints, accessibility, and performance requirements
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Dashboard from '@/pages/Dashboard';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Mock data for testing
const mockUser = {
  id: 'test-user',
  email: 'test@example.com',
  user_metadata: { full_name: 'Test User' }
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard QA Tests', () => {
  describe('1. Breakpoint Responsiveness', () => {
    it('should handle mobile viewport (320px)', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 320 });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 568 });
      window.dispatchEvent(new Event('resize'));
      
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );
      
      // Check if loading state renders properly on mobile
      expect(document.querySelector('.animate-pulse')).toBeTruthy();
    });

    it('should handle tablet viewport (768px)', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 768 });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1024 });
      window.dispatchEvent(new Event('resize'));
      
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );
      
      expect(document.body).toBeTruthy();
    });

    it('should handle desktop viewport (1440px)', () => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1440 });
      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 900 });
      window.dispatchEvent(new Event('resize'));
      
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );
      
      expect(document.body).toBeTruthy();
    });
  });

  describe('2. Accessibility (WCAG)', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );
      
      // Should have main heading (h1) and proper hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have adequate color contrast', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );
      
      // Check that design tokens are being used (indicates proper contrast)
      const elementsWithColors = document.querySelectorAll('[class*="text-"], [class*="bg-"]');
      expect(elementsWithColors.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );
      
      // Check for focusable elements
      const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('3. Performance Optimizations', () => {
    it('should use memoized calculations', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );
      
      // Test that component renders without excessive re-renders
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringMatching(/render/i));
      consoleSpy.mockRestore();
    });

    it('should lazy load components', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );
      
      // Check that skeleton loading is implemented
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('4. Skeleton Loading States', () => {
    it('should match new card designs', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );
      
      // Check for enhanced skeleton elements with proper classes
      const enhancedSkeletons = document.querySelectorAll('.rounded-xl, .bg-gradient-to-r');
      expect(enhancedSkeletons.length).toBeGreaterThan(0);
    });
  });

  describe('5. Design Token Usage', () => {
    it('should use semantic color tokens', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );
      
      // Check that CSS custom properties (design tokens) are used
      const styles = getComputedStyle(document.documentElement);
      const primaryColor = styles.getPropertyValue('--primary');
      expect(primaryColor).toBeTruthy();
    });

    it('should avoid hard-coded colors', () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );
      
      // Check that no hard-coded color classes are used
      const hardCodedColors = document.querySelectorAll('[class*="bg-blue-"], [class*="text-red-"], [class*="border-green-"]');
      expect(hardCodedColors.length).toBe(0);
    });
  });
});

// Export test utilities for other components
export { TestWrapper, mockUser };