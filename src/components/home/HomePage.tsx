import TextInput from '@/components/input/TextInput'
import './home-page.css'

interface HomePageProps {
  onSubmit: (text: string) => Promise<void>
  disabled?: boolean
}

export default function HomePage({ onSubmit, disabled }: HomePageProps) {
  return (
    <div className="home-page">
      <div className="home-page__greeting" aria-hidden="true">
        <span className="home-page__greeting-title">Hi, I'm rancho.</span>
        <span className="home-page__greeting-subtitle">what are we exploring today?</span>
      </div>
      <TextInput onSubmit={onSubmit} centered disabled={disabled} />
    </div>
  )
}
