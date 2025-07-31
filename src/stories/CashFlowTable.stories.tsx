import type { Meta, StoryObj } from '@storybook/react';
import { CashFlowTable } from '@/components/model/CashFlowTable';

const meta: Meta<typeof CashFlowTable> = {
  title: 'Model/CashFlowTable',
  component: CashFlowTable,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockCashflow = Array.from({ length: 60 }, (_, i) => 
  (Math.random() - 0.5) * 100000 * (1 + i * 0.1)
);

export const Default: Story = {
  args: {
    cashflow: mockCashflow,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: {
    cashflow: [],
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    cashflow: [],
    isLoading: false,
  },
};