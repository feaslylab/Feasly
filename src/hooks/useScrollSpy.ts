import { useState, useEffect, useCallback, useRef } from 'react';

interface ScrollSpyOptions {
  rootMargin?: string;
  threshold?: number | number[];
  enabled?: boolean;
  offsetTop?: number; // For scroll offset adjustment
}

interface ScrollSpyEntry {
  id: string;
  element: Element;
  isVisible: boolean;
  intersectionRatio: number;
  boundingRect: DOMRect;
}

export function useScrollSpy(
  sectionIds: string[],
  options: ScrollSpyOptions = {}
) {
  const {
    rootMargin = '-50% 0px -50% 0px',
    threshold = 0.01,
    enabled = true,
    offsetTop = 16
  } = options;

  const [activeSection, setActiveSection] = useState<string>('');
  const [visibleSections, setVisibleSections] = useState<ScrollSpyEntry[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const isScrollingRef = useRef(false);

  // Create intersection observer
  const createObserver = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Only update if we're not in a programmatic scroll
        if (isScrollingRef.current) return;

        const visibleEntries: ScrollSpyEntry[] = [];
        
        entries.forEach((entry) => {
          const element = entry.target;
          
          // Skip collapsed panels
          if (element.hasAttribute('data-collapsed')) {
            return;
          }

          if (entry.isIntersecting) {
            visibleEntries.push({
              id: element.id,
              element,
              isVisible: true,
              intersectionRatio: entry.intersectionRatio,
              boundingRect: entry.boundingClientRect
            });
          }
        });

        setVisibleSections(visibleEntries);

        // Find the section that should be active
        if (visibleEntries.length > 0) {
          // Sort by how close to the top of viewport and intersection ratio
          const sortedEntries = visibleEntries.sort((a, b) => {
            // Priority 1: Element closest to top with highest intersection ratio
            const aTop = Math.abs(a.boundingRect.top);
            const bTop = Math.abs(b.boundingRect.top);
            
            if (Math.abs(aTop - bTop) < 50) {
              // If very close in position, use intersection ratio
              return b.intersectionRatio - a.intersectionRatio;
            }
            
            return aTop - bTop;
          });

          const newActiveSection = sortedEntries[0].id;
          setActiveSection(newActiveSection);
        } else {
          // If no sections are visible, keep the last active section
          // unless it's completely out of view
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    // Observe all sections
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }
    });
  }, [sectionIds, rootMargin, threshold, enabled]);

  // Navigate to section with proper offset
  const scrollToSection = useCallback((sectionId: string, behavior: ScrollBehavior = 'smooth') => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    // Set scrolling flag to prevent observer updates during programmatic scroll
    isScrollingRef.current = true;
    
    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Calculate scroll position with offset
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const targetPosition = absoluteElementTop - offsetTop;

    // Perform scroll
    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior
    });

    // Immediately set active section for instant feedback
    setActiveSection(sectionId);

    // Re-enable observer after scroll completes
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, behavior === 'smooth' ? 1000 : 100);
  }, [offsetTop]);

  // Mark section as collapsed/expanded
  const setSectionCollapsed = useCallback((sectionId: string, collapsed: boolean) => {
    const element = document.getElementById(sectionId);
    if (element) {
      if (collapsed) {
        element.setAttribute('data-collapsed', 'true');
        // If the collapsed section was active, clear active state
        if (activeSection === sectionId) {
          setActiveSection('');
        }
      } else {
        element.removeAttribute('data-collapsed');
      }
    }
  }, [activeSection]);

  // Initialize observer
  useEffect(() => {
    createObserver();
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [createObserver]);

  // Re-observe when section IDs change
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      createObserver();
    }
  }, [sectionIds, createObserver]);

  return {
    activeSection,
    visibleSections,
    scrollToSection,
    setSectionCollapsed,
    isScrolling: isScrollingRef.current
  };
}
