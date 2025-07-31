import type { Meta, StoryObj } from '@storybook/react';
import { CashFlowChart } from '@/components/model/CashFlowChart';

const meta: Meta<typeof CashFlowChart> = {
  title: 'Model/CashFlowChart',
  component: CashFlowChart,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const volatileCashflow = Array.from({ length: 60 }, (_, i) => {
  const base = Math.sin(i * 0.2) * 50000;
  const trend = i * 2000;
  const noise = (Math.random() - 0.5) * 20000;
  return base + trend + noise;
});

export const Default: Story = {
  args: {
    cashflow: volatileCashflow,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    cashflow: [],
    isLoading: true,
  },
};