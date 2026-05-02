'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { SetInfo } from '../lib/types'

export default function PresetGrid({ sets }: { sets: SetInfo[] }) {
  const [mode, setMode] = useState<'timed' | 'stamina'>('timed')
  const isStamina = mode === 'stamina'

  return (
    <>
      <div className="panel-head">
        <h2>Ready-made sets</h2>
        <div className="mode-toggle">
          <button className={!isStamina ? 'active' : ''} onClick={() => setMode('timed')}>Timed</button>
          <button className={isStamina ? 'active' : ''} onClick={() => setMode('stamina')}>Stamina</button>
        </div>
      </div>
      <div className="preset-grid">
        {sets.map(({ type, name, desc, stamina }) => (
          <div key={type} className="card">
            <div>
              <p className="chip">
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
        ))}
      </div>
    </>
  )
}
