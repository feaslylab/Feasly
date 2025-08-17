import { useEngine } from '@/lib/engine/EngineContext';
import { useModelValidations } from '@/lib/validation/useModelValidations';
import { useEffect } from 'react';

export default function PreviewPanel({ onBlockingChange }: { onBlockingChange?: (b: boolean) => void }) {
  const { inputs } = useEngine();
  const { issues, hasBlocking } = useModelValidations(inputs);

  // notify parent so Run can be disabled
  useEffect(() => {
    if (onBlockingChange) {
      onBlockingChange(hasBlocking);
    }
  }, [hasBlocking, onBlockingChange]);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Preview</h2>
        <p className="text-sm text-muted-foreground">Review key checks before running calculations.</p>
      </div>

      <div className="space-y-2">
        {issues.length === 0 ? (
          <div className="text-sm text-emerald-600">No warnings. You're good to run.</div>
        ) : (
          <ul className="space-y-1">
            {issues.map((i, idx) => (
              <li key={idx} className={i.level === 'error' ? 'text-red-600 text-sm' : 'text-amber-600 text-sm'}>
                {i.level === 'error' ? 'Error: ' : 'Warning: '}
                {i.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}