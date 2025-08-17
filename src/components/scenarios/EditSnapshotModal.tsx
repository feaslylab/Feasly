'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { updateSnapshot } from '@/lib/scenarios';

interface EditSnapshotModalProps {
  id: string;
  initial: { 
    name: string;
    label?: string; 
    note?: string; 
  };
  onClose: () => void;
  onSave: () => void;
}

export default function EditSnapshotModal({ id, initial, onClose, onSave }: EditSnapshotModalProps) {
  const [name, setName] = useState(initial.name);
  const [label, setLabel] = useState(initial.label ?? '');
  const [note, setNote] = useState(initial.note ?? '');

  const handleSave = () => {
    updateSnapshot(id, { 
      name: name.trim(),
      label: label.trim() || undefined, 
      note: note.trim() || undefined 
    });
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Snapshot</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              value={name} 
              onChange={e => setName(e.target.value.slice(0, 100))}
              placeholder="Scenario name"
            />
          </div>
          
          <div>
            <Label htmlFor="label">Label (optional)</Label>
            <Input 
              id="label"
              value={label} 
              onChange={e => setLabel(e.target.value.slice(0, 32))}
              placeholder="e.g., LP-friendly, Conservative"
            />
          </div>
          
          <div>
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea 
              id="note"
              value={note} 
              onChange={e => setNote(e.target.value.slice(0, 200))}
              placeholder="Additional notes about this scenario..."
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}