import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ModelSideNav, defaultModelSections } from '@/components/model/ModelSideNav';
import { SectionPanel } from '@/components/model/SectionPanel';
import { useScrollSpy } from '@/hooks/useScrollSpy';

const meta: Meta<typeof ModelSideNav> = {
  title: 'Navigation/ScrollSpy Debug',
  component: ModelSideNav,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Debug story for ScrollSpy functionality with live section tracking.',
      },
    },
  },
  argTypes: {
    activeSection: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ModelSideNav>;

// Mock content for sections
const MockSectionContent = ({ sectionId, height = 800 }: { sectionId: string; height?: number }) => (
  <div 
    className="p-8 space-y-4" 
    style={{ height: `${height}px` }}
  >
    <h3 className="text-lg font-semibold">Section: {sectionId}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium mb-2">Content Block {i + 1}</h4>
          <p className="text-sm text-muted-foreground">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. 
            Quisquam, voluptatum. This is mock content for {sectionId}.
          </p>
        </div>
      ))}
    </div>
    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <p className="text-sm">
        <strong>Debug Info:</strong> This is section "{sectionId}" with {height}px height.
        Scroll to see active section highlighting in the navigation.
      </p>
    </div>
  </div>
);

// ScrollSpy Demo Component
function ScrollSpyDemo() {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['project-metadata'])
  );

  const sectionIds = defaultModelSections.map(s => s.id);
  
  const { activeSection, scrollToSection, setSectionCollapsed } = useScrollSpy(
    sectionIds,
    {
      enabled: true,
      offsetTop: 64,
      rootMargin: '-20% 0px -20% 0px',
      threshold: 0.3
    }
  );

  const handleSectionClick = (sectionId: string) => {
    setOpenSections(prev => new Set([...prev, sectionId]));
    scrollToSection(sectionId, 'smooth');
  };

  const handleSectionToggle = (sectionId: string, isOpen: boolean) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(sectionId);
      } else {
        newSet.delete(sectionId);
      }
      return newSet;
    });

    setSectionCollapsed(sectionId, !isOpen);
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sticky Navigation */}
      <ModelSideNav
        sections={defaultModelSections}
        activeSection={activeSection}
        onSectionClick={handleSectionClick}
        isMobile={false}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur h-16 flex items-center px-6">
          <h1 className="text-lg font-semibold">ScrollSpy Debug Demo</h1>
          <div className="ml-auto text-sm text-muted-foreground">
            Active: <span className="font-medium text-primary">{activeSection || 'None'}</span>
          </div>
        </div>

        {/* Sections */}
        <div className="p-6 space-y-6">
          {defaultModelSections.map((section, index) => (
            <SectionPanel
              key={section.id}
              id={section.id}
              title={section.title}
              status={section.status}
              isOpen={openSections.has(section.id)}
              onToggle={(open) => handleSectionToggle(section.id, open)}
              className="scroll-mt-20" // Account for sticky header
            >
              <MockSectionContent 
                sectionId={section.id} 
                height={index % 3 === 0 ? 1200 : 800} // Varying heights
              />
            </SectionPanel>
          ))}
          
          {/* Spacer for testing scroll end */}
          <div className="h-96 flex items-center justify-center text-muted-foreground">
            <p>End of content - Test scrolling behavior</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <ScrollSpyDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing ScrollSpy behavior with collapsible sections and sticky navigation.',
      },
    },
  },
};

export const MobileView: Story = {
  render: () => <ScrollSpyDemo />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Mobile version showing tab navigation and sheet overlay.',
      },
    },
  },
};

// Test different scroll positions
export const ScrolledState: Story = {
  render: () => {
    const demo = <ScrollSpyDemo />;
    
    // Auto-scroll to middle section on mount
    setTimeout(() => {
      const element = document.getElementById('financial-inputs');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 1000);
    
    return demo;
  },
  parameters: {
    docs: {
      description: {
        story: 'Demo with automatic scroll to test active section highlighting.',
      },
    },
  },
};