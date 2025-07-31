import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAlerts } from '@/hooks/useAlerts'

interface AlertDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function AlertDrawer({ isOpen, onClose }: AlertDrawerProps) {
  const { alerts, loading, markAllAsRead } = useAlerts()

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
      default: return 'outline'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <Clock className="h-4 w-4" />
      default:
        return <CheckCircle className="h-4 w-4" />
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-background shadow-xl">
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-medium">
                          Alerts
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="rounded-md hover:bg-accent"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-4 sm:px-6">
                      {alerts.filter(a => !a.resolved).length > 0 && (
                        <Button
                          onClick={markAllAsRead}
                          variant="outline"
                          size="sm"
                          className="w-full mb-4"
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>

                    <div className="relative flex-1 px-4 sm:px-6">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-sm text-muted-foreground">Loading alerts...</div>
                        </div>
                      ) : alerts.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-sm text-muted-foreground">No alerts</div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {alerts.map((alert) => (
                            <div
                              key={alert.id}
                              className={`rounded-lg border p-4 ${
                                alert.resolved ? 'opacity-60' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  {getSeverityIcon(alert.severity)}
                                  <Badge variant={getSeverityColor(alert.severity)}>
                                    {alert.severity}
                                  </Badge>
                                </div>
                                {alert.resolved && (
                                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              
                              <h3 className="font-medium mt-2">{alert.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {alert.body}
                              </p>
                              
                              <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(alert.triggered_at).toLocaleDateString()}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {alert.alert_type}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}