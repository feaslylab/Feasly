import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useRef, useState } from 'react';

export default function NewScenarioDialog({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  /* ① focus should land on the input when dialog opens */
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    await onCreate(name.trim());
    setSaving(false);
    setName('');
  };

  /* ② press Enter should submit, Esc should cancel */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave().then(onClose);
    }
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClose={onClose}            /* Esc & outside-click close */
        initialFocus={inputRef}      /* auto-focus textbox */
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-60"
          leave="ease-in duration-150"
          leaveFrom="opacity-60"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        {/* Panel */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95 translate-y-2"
          enterTo="opacity-100 scale-100 translate-y-0"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100 translate-y-0"
          leaveTo="opacity-0 scale-95 translate-y-2"
        >
          <Dialog.Panel
            /* prevent accidental close when clicking **inside** panel */
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl ring-1 ring-black/10"
          >
            <Dialog.Title className="text-lg font-medium">
              New scenario
            </Dialog.Title>

            <label className="mt-4 block text-sm font-medium">
              Scenario name
              <input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="mt-1 w-full rounded-md border px-3 py-2 shadow-inner
                           bg-background/70 backdrop-blur focus:outline-none
                           focus:ring focus:ring-primary focus:border-primary"
                placeholder="e.g. Base case"
              />
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!name.trim() || saving}
                onClick={async () => {
                  await handleSave();
                  onClose();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : 'Create'}
              </button>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}