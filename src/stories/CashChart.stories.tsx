import type { Meta, StoryObj } from '@storybook/react';
import CashChart from '../components/CashChart';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof CashChart> = {
  title: 'Components/CashChart',
  component: CashChart,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="min-h-screen bg-background text-foreground p-4">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data representing 24 months of cash flow
const sampleData = [
  -500000, -400000, -300000, -200000, -100000, 0,
  100000, 200000, 300000, 400000, 500000, 600000,
  700000, 800000, 900000, 1000000, 1100000, 1200000,
  1300000, 1400000, 1500000, 1600000, 1700000, 1800000
];

export const Default: Story = {
  args: {
    data: sampleData,
  },
};

export const NoData: Story = {
  args: {
    data: [],
  },
};

export const AllZeros: Story = {
  args: {
    data: new Array(24).fill(0),
  },
};

export const VolatileData: Story = {
  args: {
    data: [
      -1000000, 500000, -300000, 800000, -200000, 600000,
      -400000, 900000, -100000, 700000, 200000, 1200000,
      -600000, 400000, 800000, -300000, 1100000, -500000,
      900000, 300000, 1400000, -200000, 1000000, 1600000
    ],
  },
};