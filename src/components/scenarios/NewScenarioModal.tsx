import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface NewScenarioModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (name: string) => void
}

export function NewScenarioModal({ isOpen, onClose, onConfirm }: NewScenarioModalProps) {
  const [scenarioName, setScenarioName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (scenarioName.trim()) {
      onConfirm(scenarioName.trim())
      setScenarioName('')
      onClose()
    }
  }

  const handleClose = () => {
    setScenarioName('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New scenario name</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scenario-name">Scenario name</Label>
            <Input
              id="scenario-name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Enter scenario name"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!scenarioName.trim()}>
              OK
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}