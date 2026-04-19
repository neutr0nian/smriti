import './conversation-title.css'

interface ConversationTitleProps {
  subject: string
  title: string
}

export default function ConversationTitle({ subject, title }: ConversationTitleProps) {
  return (
    <div className="conversation-title">
      <h6 className="conversation-title__subject">{subject}</h6>
      <h1>{title}</h1>
    </div>
  )
}
