import './button.css'

type ButtonColor = 'accent' | 'ink' | 'ghost'
type ButtonSize  = 'sm' | 'md' | 'lg'

interface ButtonProps {
  text: string
  color?: ButtonColor
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}

export default function Button({
  text,
  color = 'accent',
  size = 'md',
  type = 'button',
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`button button--${size} button--${color}`}
      onClick={onClick}
    >
      {text}
    </button>
  )
}
