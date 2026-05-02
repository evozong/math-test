'use client'

import { useSearchParams } from 'next/navigation'
import Link from './Link'
import type { SetInfo } from '../lib/types'

export default function PresetGrid({ sets }: { sets: SetInfo[] }) {
  const searchParams = useSearchParams()
  const isStamina = searchParams.get('mode') === 'stamina'

  return (
    <>
      <div className="panel-head">
        <h2>Ready-made sets</h2>
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
            <Link href={`/sets/${type}?autoStart`} className="primary">
              Start
            </Link>
          </div>
        ))}
      </div>
    </>
  )
}
