import type { Meta, StoryObj } from '@storybook/react';
import { ModelSideNav, defaultModelSections } from '@/components/model/ModelSideNav';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof ModelSideNav> = {
  title: 'Model/ModelSideNav',
  component: ModelSideNav,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div className="h-screen w-full">
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  argTypes: {
    isMobile: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ModelSideNav>;

const mockSections = defaultModelSections.map((section, index) => ({
  ...section,
  status: index < 2 ? 'valid' : index < 4 ? 'warning' : index < 6 ? 'error' : 'empty'
}));

export const Desktop: Story = {
  args: {
    sections: mockSections,
    activeSection: 'timeline',
    onSectionClick: (sectionId: string) => console.log('Navigate to:', sectionId),
    isMobile: false,
  },
};

export const Mobile: Story = {
  args: {
    sections: mockSections,
    activeSection: 'project-metadata',
    onSectionClick: (sectionId: string) => console.log('Navigate to:', sectionId),
    isMobile: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const AllStatusTypes: Story = {
  args: {
    sections: [
      { ...mockSections[0], status: 'valid' },
      { ...mockSections[1], status: 'warning' },
      { ...mockSections[2], status: 'error' },
      { ...mockSections[3], status: 'empty' },
      ...mockSections.slice(4),
    ],
    activeSection: 'validation',
    onSectionClick: (sectionId: string) => console.log('Navigate to:', sectionId),
    isMobile: false,
  },
};