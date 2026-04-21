import './button.css'

type ButtonColor = 'accent' | 'ink' | 'ghost'
type ButtonSize  = 'sm' | 'md' | 'lg'

interface ButtonProps {
  text: string
  color?: ButtonColor
  size?: ButtonSize
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: () => void
}

export default function Button({
  text,
  color = 'accent',
  size = 'md',
  type = 'button',
  disabled,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`button button--${size} button--${color}`}
      disabled={disabled}
      onClick={onClick}
    >
      {text}
    </button>
  )
}
