import './conversation.css'

interface ConversationProps {
  children: React.ReactNode
}

export default function Conversation({ children }: ConversationProps) {
  return (
    <div className="conversation">
      {children}
    </div>
  )
}
