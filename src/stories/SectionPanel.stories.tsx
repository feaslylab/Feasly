import type { Meta, StoryObj } from '@storybook/react';
import { SectionPanel, SectionStatus } from '@/components/model/SectionPanel';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof SectionPanel> = {
  title: 'Model/SectionPanel',
  component: SectionPanel,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="max-w-4xl">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  argTypes: {
    status: {
      control: 'select',
      options: ['valid', 'warning', 'error', 'empty'] as SectionStatus[],
    },
    isOpen: {
      control: 'boolean',
    },
    lazyLoad: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SectionPanel>;

const MockContent = () => (
  <div className="space-y-4">
    <p className="text-sm text-muted-foreground">
      This is mock content for the section panel. In a real implementation, 
      this would contain form fields, charts, or other interactive elements.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border rounded bg-muted/30">
        <h4 className="font-medium mb-2">Sample Field Group</h4>
        <div className="space-y-2">
          <div className="h-8 bg-background border rounded"></div>
          <div className="h-8 bg-background border rounded"></div>
        </div>
      </div>
      <div className="p-4 border rounded bg-muted/30">
        <h4 className="font-medium mb-2">Another Field Group</h4>
        <div className="space-y-2">
          <div className="h-8 bg-background border rounded"></div>
          <div className="h-8 bg-background border rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

export const Default: Story = {
  args: {
    id: 'example-section',
    title: 'Project Information',
    status: 'empty',
    isOpen: false,
    children: <MockContent />,
  },
};

export const Expanded: Story = {
  args: {
    id: 'expanded-section',
    title: 'Project Information',
    status: 'empty',
    isOpen: true,
    children: <MockContent />,
  },
};

export const ValidStatus: Story = {
  args: {
    id: 'valid-section',
    title: 'Completed Section',
    status: 'valid',
    isOpen: true,
    children: <MockContent />,
  },
};

export const WarningStatus: Story = {
  args: {
    id: 'warning-section',
    title: 'Section with Warnings',
    status: 'warning',
    isOpen: true,
    children: <MockContent />,
  },
};

export const ErrorStatus: Story = {
  args: {
    id: 'error-section',
    title: 'Section with Errors',
    status: 'error',
    isOpen: true,
    children: <MockContent />,
  },
};

export const LazyLoaded: Story = {
  args: {
    id: 'lazy-section',
    title: 'Lazy Loaded Section',
    status: 'empty',
    isOpen: false,
    lazyLoad: true,
    children: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This content is only rendered when the panel is opened (lazy loading).
        </p>
        <div className="h-32 bg-gradient-to-r from-primary/10 to-secondary/10 border rounded flex items-center justify-center">
          <span className="text-muted-foreground">Heavy Component (Charts, Tables, etc.)</span>
        </div>
      </div>
    ),
  },
};