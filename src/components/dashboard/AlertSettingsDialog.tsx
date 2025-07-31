import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, TrendingDown, TrendingUp } from 'lucide-react'
import { useAlertPref } from '@/hooks/useAlertPref'

interface AlertSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function AlertSettingsDialog({ isOpen, onClose }: AlertSettingsDialogProps) {
  const { preferences, loading, saving, savePreferences } = useAlertPref()
  const [formData, setFormData] = useState({
    npv_threshold: preferences.npv_threshold,
    irr_threshold: preferences.irr_threshold * 100 // Convert to percentage for display
  })

  // Update form when preferences load
  useEffect(() => {
    setFormData({
      npv_threshold: preferences.npv_threshold,
      irr_threshold: preferences.irr_threshold * 100
    })
  }, [preferences])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await savePreferences({
      npv_threshold: formData.npv_threshold,
      irr_threshold: formData.irr_threshold / 100 // Convert back to decimal
    })
    onClose()
  }

  const handleClose = () => {
    // Reset form to current preferences
    setFormData({
      npv_threshold: preferences.npv_threshold,
      irr_threshold: preferences.irr_threshold * 100
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Alert Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Configure when you want to receive alerts for your projects. Alerts will be sent when your project's KPIs fall below these thresholds.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  NPV Threshold
                </CardTitle>
                <CardDescription>
                  Alert me when Net Present Value falls below this amount (AED)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="npv-threshold">NPV Threshold (AED)</Label>
                  <Input
                    id="npv-threshold"
                    type="number"
                    value={formData.npv_threshold}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      npv_threshold: Number(e.target.value)
                    }))}
                    placeholder="0"
                    disabled={loading || saving}
                  />
                  <div className="text-xs text-muted-foreground">
                    Default: 0 AED (alerts for any negative NPV)
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  IRR Threshold
                </CardTitle>
                <CardDescription>
                  Alert me when Internal Rate of Return falls below this percentage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="irr-threshold">IRR Threshold (%)</Label>
                  <Input
                    id="irr-threshold"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.irr_threshold}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      irr_threshold: Number(e.target.value)
                    }))}
                    placeholder="8.0"
                    disabled={loading || saving}
                  />
                  <div className="text-xs text-muted-foreground">
                    Default: 8% (typical real estate investment threshold)
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}