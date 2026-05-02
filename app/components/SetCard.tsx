'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SetInfo } from '../lib/types'

export default function SetCard({ set }: { set: SetInfo }) {
  const [mode, setMode] = useState<'timed' | 'stamina'>('timed')
  const { type, name, desc, stamina } = set
  const isStamina = mode === 'stamina'

  return (
    <div className="card">
      <div>
        <div className="mode-toggle">
          <button className={!isStamina ? 'active' : ''} onClick={() => setMode('timed')}>Timed</button>
          <button className={isStamina ? 'active' : ''} onClick={() => setMode('stamina')}>Stamina</button>
        </div>
        <p className={`chip${isStamina ? ' alt' : ''}`}>
          {isStamina ? `${stamina.startSecs}s · +${stamina.bonusSecs}s per correct` : '10 questions'}
        </p>
        <h3><Link href={`/sets/${type}`}>{name}</Link></h3>
        <p className="muted">{desc}</p>
      </div>
      <Link
        href={isStamina ? `/sets/${type}?mode=stamina&autoStart` : `/sets/${type}?autoStart`}
        className="primary"
      >
        Start
      </Link>
    </div>
  )
}
