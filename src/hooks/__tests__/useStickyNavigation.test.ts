import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStickyNavigation } from '../useStickyNavigation';

// Mock useIsMobile
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

beforeEach(() => {
  // Mock window properties
  Object.defineProperty(window, 'innerWidth', {
    value: 1200,
    writable: true,
  });

  Object.defineProperty(window, 'pageYOffset', {
    value: 0,
    writable: true,
  });

  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn((cb) => {
    cb(0);
    return 0;
  });

  // Mock addEventListener/removeEventListener
  window.addEventListener = vi.fn();
  window.removeEventListener = vi.fn();
});

describe('useStickyNavigation', () => {
  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useStickyNavigation());
    
    expect(result.current.isSticky).toBe(false);
    expect(result.current.shouldBeSticky).toBe(true); // Desktop, enabled
    expect(result.current.shouldUsePortal).toBe(false);
  });

  it('returns correct sticky container styles for desktop', () => {
    const { result } = renderHook(() => useStickyNavigation({
      topOffset: 80,
      maxHeight: 'calc(100vh - 5rem)'
    }));
    
    const styles = result.current.getStickyContainerStyles();
    
    expect(styles).toEqual(
      expect.objectContaining({
        position: 'sticky',
        top: '80px',
        alignSelf: 'flex-start',
        maxHeight: 'calc(100vh - 5rem)',
        overflowY: 'auto',
        overflowX: 'hidden',
      })
    );
  });

  it('returns empty styles when not sticky enabled', () => {
    const { result } = renderHook(() => useStickyNavigation({
      enabled: false
    }));
    
    const styles = result.current.getStickyContainerStyles();
    
    expect(styles).toEqual({});
  });

  it('returns portal styles when portal is needed', () => {
    const { result } = renderHook(() => useStickyNavigation());
    
    // Simulate portal needed
    result.current.checkStickyParent(null);
    
    const portalStyles = result.current.getPortalStyles();
    
    expect(portalStyles).toEqual({});
  });

  it('sets up scroll and resize listeners', () => {
    renderHook(() => useStickyNavigation());
    
    expect(window.addEventListener).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function),
      { passive: true }
    );
    expect(window.addEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });

  it('handles different breakpoints correctly', () => {
    // Test below breakpoint
    Object.defineProperty(window, 'innerWidth', {
      value: 800,
      writable: true,
    });

    const { result: result1 } = renderHook(() => useStickyNavigation({
      breakpoint: 1024
    }));
    
    expect(result1.current.shouldBeSticky).toBe(false);

    // Test above breakpoint
    Object.defineProperty(window, 'innerWidth', {
      value: 1200,
      writable: true,
    });

    const { result: result2 } = renderHook(() => useStickyNavigation({
      breakpoint: 1024
    }));
    
    expect(result2.current.shouldBeSticky).toBe(true);
  });

  it('detects problematic parent containers', () => {
    const { result } = renderHook(() => useStickyNavigation());
    
    // Mock DOM element with overflow scroll
    const mockElement = {
      parentElement: {
        parentElement: null,
        style: {},
      },
    } as HTMLElement;

    // Mock getComputedStyle
    window.getComputedStyle = vi.fn().mockReturnValue({
      overflow: 'scroll',
      overflowY: 'auto',
    });

    const hasProblematicParent = result.current.checkStickyParent(mockElement);
    
    expect(hasProblematicParent).toBe(true);
  });

  it('provides correct offset and height values', () => {
    const customOptions = {
      topOffset: 100,
      maxHeight: 'calc(100vh - 6rem)'
    };

    const { result } = renderHook(() => useStickyNavigation(customOptions));
    
    expect(result.current.topOffset).toBe(100);
    expect(result.current.maxHeight).toBe('calc(100vh - 6rem)');
  });
});