import { Plus } from 'lucide-react'
import Tooltip from '@/components/tooltip/Tooltip'
import './gap-plus.css'

interface GapPlusProps {
  onAdd: () => void
}

export default function GapPlus({ onAdd }: GapPlusProps) {
  return (
    <Tooltip content="Add a note" placement="right">
      <div className="gap-plus" onClick={onAdd}>
        <div className="gap-plus__line" />
        <button type="button" className="gap-plus__btn" aria-label="Add note">
          <Plus size={10} />
        </button>
      </div>
    </Tooltip>
  )
}
