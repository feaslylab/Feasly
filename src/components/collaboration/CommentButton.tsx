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
  compact?: boolean  // New compact prop for chip style
}

export function CommentButton({ 
  targetId, 
  targetLabel, 
  className = '',
  variant = 'ghost',
  size = 'sm',
  compact = false
}: CommentButtonProps) {
  if (!targetId) {
    console.log('CommentButton: targetId is missing');
    return null;
  }
  
  console.log('CommentButton: targetId =', targetId);
  const [commentsOpen, setCommentsOpen] = useState(false)

  if (compact) {
    // Render as a compact chip
    return (
      <>
        <button
          onClick={() => setCommentsOpen(true)}
          className={`inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors ${className}`}
          title="Add comment"
        >
          💬 Add comment
        </button>

        <CommentsBar
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
          targetId={targetId}
          targetLabel={targetLabel}
        />
      </>
    )
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => {
          console.log('CommentButton clicked, opening comments for:', targetId);
          setCommentsOpen(true);
        }}
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