import { MessageCircle } from 'lucide-react'
import { usePresence } from '@/hooks/usePresence'
import { useSelectionStore } from '@/state/selectionStore'

interface PresenceDotsProps {
  className?: string
}

export function PresenceDots({ className = '' }: PresenceDotsProps) {
  const { projectId } = useSelectionStore()
  const { presenceUsers } = usePresence(projectId || '')

  if (!projectId || presenceUsers.length === 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <MessageCircle className="h-4 w-4 text-muted-foreground" />
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
    </div>
  )
}