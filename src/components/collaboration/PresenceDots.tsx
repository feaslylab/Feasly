import { MessageCircle } from 'lucide-react'
import { usePresence } from '@/hooks/usePresence'
import { useSelectionStore } from '@/state/selectionStore'

interface PresenceDotsProps {
  className?: string
}

export function PresenceDots({ className = '' }: PresenceDotsProps) {
  const { projectId } = useSelectionStore()
  const { presenceUsers } = usePresence(projectId || '')

  console.log('PresenceDots render - projectId:', projectId, 'presenceUsers:', presenceUsers)

  if (!projectId) {
    console.log('PresenceDots: No projectId, not rendering')
    return null
  }

  // Always show the presence dots container, even if no users
  return (
    <div className={`flex items-center gap-1 ${className}`} data-testid="presence-dots">
      <MessageCircle className="h-4 w-4 text-muted-foreground" />
      {presenceUsers.length > 0 ? (
        <div className="flex -space-x-1">
          {presenceUsers.slice(0, 3).map((user) => (
            <div
              key={user.user_id}
              className={`w-6 h-6 rounded-full ${user.color} flex items-center justify-center text-white text-xs font-medium border-2 border-background relative`}
              title={`${user.display_name} (online)`}
            >
              {user.initials}
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background"></div>
            </div>
          ))}
          {presenceUsers.length > 3 && (
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium border-2 border-background">
              +{presenceUsers.length - 3}
            </div>
          )}
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">No active users</span>
      )}
    </div>
  )
}