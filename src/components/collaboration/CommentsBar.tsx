import { useState, useRef, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Send, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useNewComments } from '@/hooks/useNewComments'
import { useAuth } from '@/components/auth/AuthProvider'
import { format } from 'date-fns'

interface CommentsBarProps {
  isOpen: boolean
  onClose: () => void
  targetId?: string
  targetLabel?: string
}

export function CommentsBar({ isOpen, onClose, targetId, targetLabel }: CommentsBarProps) {
  const { user } = useAuth()
  const { comments, loading, addComment } = useNewComments(targetId)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [comments])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !targetId || sending) return

    setSending(true)
    try {
      const projectId = targetId.includes(':') 
        ? targetId.split(':')[0] 
        : targetId

      await addComment({
        project_id: projectId,
        target: targetId.includes(':') ? targetId : undefined,
        message: newMessage.trim()
      })

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const getUserInitials = (userId: string) => {
    // Simple user identification - in a real app you'd fetch user data
    return userId.slice(0, 2).toUpperCase()
  }

  const getUserColor = (userId: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500', 
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500'
    ]
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <Transition.Root show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as="div"
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
                as="div"
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-background shadow-xl border-l">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-6 border-b">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        <Dialog.Title className="text-lg font-medium">
                          Comments
                        </Dialog.Title>
                        {targetLabel && (
                          <Badge variant="outline" className="text-xs">
                            {targetLabel}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="rounded-md hover:bg-accent"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-sm text-muted-foreground">Loading comments...</div>
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <div className="text-sm text-muted-foreground">No comments yet</div>
                            <div className="text-xs text-muted-foreground">Start the conversation</div>
                          </div>
                        </div>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div 
                              className={`w-8 h-8 rounded-full ${getUserColor(comment.user_id)} flex items-center justify-center text-white text-xs font-medium flex-shrink-0`}
                            >
                              {getUserInitials(comment.user_id)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">
                                  {comment.user_id === user?.id ? 'You' : 'User'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(comment.created_at), 'MMM dd, HH:mm')}
                                </span>
                              </div>
                              <div className="bg-accent rounded-lg px-3 py-2 text-sm">
                                {comment.message}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t px-4 py-4">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a comment..."
                          disabled={sending}
                          className="flex-1"
                        />
                        <Button 
                          type="submit" 
                          size="sm" 
                          disabled={!newMessage.trim() || sending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
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