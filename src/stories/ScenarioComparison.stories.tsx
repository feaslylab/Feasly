import type { Meta, StoryObj } from '@storybook/react';
import ScenarioComparison from '@/pages/model/ScenarioComparison';
import { BrowserRouter } from 'react-router-dom';

const meta: Meta<typeof ScenarioComparison> = {
  title: 'Model/ScenarioComparison', 
  component: ScenarioComparison,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ScenarioComparison>;

export const Default: Story = {
  args: {},
};