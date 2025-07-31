import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedHero } from '../components/marketing/AnimatedHero';

const meta: Meta<typeof AnimatedHero> = {
  title: 'Marketing/Hero',
  component: AnimatedHero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};