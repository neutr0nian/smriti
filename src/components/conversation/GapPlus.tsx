import { Plus } from 'lucide-react'
import './gap-plus.css'

interface GapPlusProps {
  onAdd: () => void
}

export default function GapPlus({ onAdd }: GapPlusProps) {
  return (
    <div className="gap-plus" onClick={onAdd}>
      <div className="gap-plus__line" />
      <button type="button" className="gap-plus__btn" aria-label="Add note">
        <Plus size={10} />
      </button>
    </div>
  )
}
