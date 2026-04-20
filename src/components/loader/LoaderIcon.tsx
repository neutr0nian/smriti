import './loader-icon.css'

interface LoaderIconProps {
  size?: number
  color?: string
  className?: string
}

export default function LoaderIcon({ size = 24, color = 'currentColor', className = '' }: LoaderIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`loader-icon ${className}`.trim()}
      aria-label="Loading"
      role="status"
    >
      <path className="loader-icon__spoke loader-icon__spoke--0"  d="M12 2v5.5"/>
      <path className="loader-icon__spoke loader-icon__spoke--1"  d="M13.4 10.6 19.1 4.9"/>
      <path className="loader-icon__spoke loader-icon__spoke--2"  d="M17 12h5"/>
      <path className="loader-icon__spoke loader-icon__spoke--3"  d="M13.8 13.8 19.1 19.1"/>
      <path className="loader-icon__spoke loader-icon__spoke--4"  d="M12 15.5v6.5"/>
      <path className="loader-icon__spoke loader-icon__spoke--5"  d="M8.5 15.5 4.9 19.1"/>
      <path className="loader-icon__spoke loader-icon__spoke--6"  d="M2 12h8"/>
      <path className="loader-icon__spoke loader-icon__spoke--7"  d="M9.2 9.2 4.9 4.9"/>
    </svg>
  )
}
