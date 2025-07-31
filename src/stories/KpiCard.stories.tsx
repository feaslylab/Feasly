import type { Meta, StoryObj } from '@storybook/react';
import KpiCard from '../components/KpiCard';

const meta: Meta<typeof KpiCard> = {
  title: 'Components/KpiCard',
  component: KpiCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'number' },
    label: { control: 'text' },
    format: { control: 'select', options: ['currency', 'percentage', 'number'] },
    trend: { control: 'select', options: ['up', 'down', 'stable'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Currency: Story = {
  args: {
    value: 1250000,
    label: 'Total Portfolio Value',
    format: 'currency',
    trend: 'up',
  },
};

export const Percentage: Story = {
  args: {
    value: 12.5,
    label: 'Average IRR',
    format: 'percentage',
    trend: 'up',
  },
};

export const Number: Story = {
  args: {
    value: 8,
    label: 'Active Projects',
    format: 'number',
    trend: 'stable',
  },
};

export const Negative: Story = {
  args: {
    value: -5.2,
    label: 'Monthly Change',
    format: 'percentage',
    trend: 'down',
  },
};