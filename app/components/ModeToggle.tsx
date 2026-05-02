'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function ModeToggle() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const isStamina = searchParams.get('mode') === 'stamina'

  const setMode = (mode: 'timed' | 'stamina') => {
    router.push(mode === 'stamina' ? `${pathname}?mode=stamina` : pathname)
  }

  return (
    <div className="panel mode-panel">
      <div className="mode-panel-head">
        <h2>Mode</h2>
        <div className="mode-toggle">
          <button className={!isStamina ? 'active' : ''} onClick={() => setMode('timed')}>Timed</button>
          <button className={isStamina ? 'active' : ''} onClick={() => setMode('stamina')}>Stamina</button>
        </div>
      </div>
      <p className="muted small">
        {isStamina
          ? 'Keep answering to stay alive — each correct answer adds time.'
          : 'Answer 10 questions as fast as you can.'}
      </p>
    </div>
  )
}
