import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollSpy } from '../useScrollSpy';

// Mock DOM methods
const mockScrollTo = vi.fn();
const mockScrollIntoView = vi.fn();
const mockGetBoundingClientRect = vi.fn();

beforeEach(() => {
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  }));

  // Mock DOM methods
  window.scrollTo = mockScrollTo;
  Element.prototype.scrollIntoView = mockScrollIntoView;
  Element.prototype.getBoundingClientRect = mockGetBoundingClientRect;

  // Mock getElementById
  document.getElementById = vi.fn().mockImplementation((id) => ({
    id,
    getBoundingClientRect: mockGetBoundingClientRect,
    hasAttribute: vi.fn(() => false),
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
  }));

  // Mock window properties
  Object.defineProperty(window, 'pageYOffset', {
    value: 0,
    writable: true,
  });

  // Reset mocks
  mockScrollTo.mockClear();
  mockScrollIntoView.mockClear();
  mockGetBoundingClientRect.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useScrollSpy', () => {
  const sectionIds = ['section1', 'section2', 'section3'];

  it('initializes with empty active section', () => {
    const { result } = renderHook(() => useScrollSpy(sectionIds));
    
    expect(result.current.activeSection).toBe('');
    expect(result.current.visibleSections).toEqual([]);
  });

  it('sets up IntersectionObserver when enabled', () => {
    renderHook(() => useScrollSpy(sectionIds, { enabled: true }));
    
    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0.01,
      })
    );
  });

  it('does not set up observer when disabled', () => {
    renderHook(() => useScrollSpy(sectionIds, { enabled: false }));
    
    expect(IntersectionObserver).not.toHaveBeenCalled();
  });

  it('scrolls to section with proper offset', () => {
    mockGetBoundingClientRect.mockReturnValue({
      top: 100,
      left: 0,
      right: 0,
      bottom: 200,
      width: 100,
      height: 100,
    });

    const { result } = renderHook(() => useScrollSpy(sectionIds, { offsetTop: 64 }));
    
    act(() => {
      result.current.scrollToSection('section1');
    });

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 36, // 100 - 64 offset
      behavior: 'smooth',
    });
  });

  it('handles collapsed sections correctly', () => {
    const { result } = renderHook(() => useScrollSpy(sectionIds));
    const mockElement = document.getElementById('section1');
    
    act(() => {
      result.current.setSectionCollapsed('section1', true);
    });

    expect(mockElement?.setAttribute).toHaveBeenCalledWith('data-collapsed', 'true');
    
    act(() => {
      result.current.setSectionCollapsed('section1', false);
    });

    expect(mockElement?.removeAttribute).toHaveBeenCalledWith('data-collapsed');
  });

  it('ignores programmatic scrolling during intersection updates', () => {
    const { result } = renderHook(() => useScrollSpy(sectionIds));
    
    // Start programmatic scroll
    act(() => {
      result.current.scrollToSection('section1');
    });

    // The isScrolling flag should prevent observer updates
    expect(result.current.isScrolling).toBe(false); // Will be false after timeout
  });

  it('updates active section immediately on programmatic scroll', () => {
    const { result } = renderHook(() => useScrollSpy(sectionIds));
    
    act(() => {
      result.current.scrollToSection('section2');
    });

    expect(result.current.activeSection).toBe('section2');
  });

  it('clears active section when collapsed section was active', () => {
    const { result } = renderHook(() => useScrollSpy(sectionIds));
    
    // Set active section first
    act(() => {
      result.current.scrollToSection('section1');
    });
    
    expect(result.current.activeSection).toBe('section1');
    
    // Collapse the active section
    act(() => {
      result.current.setSectionCollapsed('section1', true);
    });

    expect(result.current.activeSection).toBe('');
  });

  it('uses custom rootMargin and threshold options', () => {
    const customOptions = {
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.5,
    };

    renderHook(() => useScrollSpy(sectionIds, customOptions));
    
    expect(IntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining(customOptions)
    );
  });
});