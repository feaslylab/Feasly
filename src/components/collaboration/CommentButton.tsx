import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CommentsBar } from './CommentsBar'

interface CommentButtonProps {
  targetId: string
  targetLabel?: string
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'default' | 'lg'
}

export function CommentButton({ 
  targetId, 
  targetLabel, 
  className = '',
  variant = 'ghost',
  size = 'sm'
}: CommentButtonProps) {
  const [commentsOpen, setCommentsOpen] = useState(false)

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setCommentsOpen(true)}
        className={`${className}`}
        title="Open comments"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>

      <CommentsBar
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        targetId={targetId}
        targetLabel={targetLabel}
      />
    </>
  )
}