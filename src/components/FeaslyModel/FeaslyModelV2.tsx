import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { feaslyModelSchema, type FeaslyModelFormData } from './types';
import { FormContent } from './FormContent';

// Check if v2 feature flag is enabled
const isV2Enabled = import.meta.env.VITE_MODEL_V2 === 'true';

interface FeaslyModelV2Props {
  projectId: string;
  onSubmit: (data: FeaslyModelFormData) => Promise<void>;
  onSaveDraft: () => void;
  initialData?: Partial<FeaslyModelFormData>;
}

function FeaslyModelV2({ projectId, onSubmit, onSaveDraft, initialData }: FeaslyModelV2Props) {
  // Form setup
  const form = useForm<FeaslyModelFormData>({
    resolver: zodResolver(feaslyModelSchema),
    defaultValues: {
      phasing_enabled: false,
      zakat_applicable: false,
      escrow_required: false,
      currency_code: "SAR",
      ...initialData,
    },
  });

  return (
    <FormProvider {...form}>
      <FormContent 
        projectId={projectId}
        onSubmit={onSubmit}
        onSaveDraft={onSaveDraft}
      />
    </FormProvider>
  );
}

export { FeaslyModelV2, isV2Enabled };