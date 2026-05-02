'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { QuestionType } from '../lib/types'

const TYPES: { type: QuestionType; label: string; sub: string }[] = [
  { type: 'add20',  label: 'Addition to 20',                sub: '0-9 with +' },
  { type: 'sub20',  label: 'Subtraction to 20',             sub: '0-20 with -' },
  { type: 'mul9',   label: 'Multiplication to 9',           sub: '1-9 with ×' },
  { type: 'mul12',  label: 'Multiplication to 12',          sub: '1-12 with ×' },
  { type: 'div9',   label: 'Division to 9',                 sub: 'No remainders, divisors 1-9' },
  { type: 'div12',  label: 'Division to 12',                sub: 'No remainders, divisors 1-12' },
  { type: 'div9r',  label: 'Division to 9 with Remainder',  sub: 'Quotient + remainder, divisors 2-9' },
  { type: 'div12r', label: 'Division to 12 with Remainder', sub: 'Quotient + remainder, divisors 2-12' },
]

export default function CustomSetBuilder() {
  const [selected, setSelected] = useState<QuestionType[]>([])
  const searchParams = useSearchParams()
  const isStamina = searchParams.get('mode') === 'stamina'
  const router = useRouter()

  const toggle = (type: QuestionType) =>
    setSelected(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])

  const handleStart = () => {
    const params = new URLSearchParams()
    selected.forEach(t => params.append('i', t))
    params.set('autoStart', '')
    if (isStamina) params.set('mode', 'stamina')
    router.push(`/sets/custom?${params}`)
  }

  return (
    <>
      <div className="panel-head">
        <h2><Link href="/sets/custom">Build your own!</Link></h2>
      </div>
      <div className="custom-grid">
        {TYPES.map(({ type, label, sub }) => (
          <label key={type} className={`picker ${selected.includes(type) ? 'active' : ''}`}>
            <input type="checkbox" checked={selected.includes(type)} onChange={() => toggle(type)} />
            <div>
              <strong>{label}</strong>
              <span className="muted small">{sub}</span>
            </div>
          </label>
        ))}
      </div>
      <button className="primary wide" onClick={handleStart} disabled={selected.length === 0}>
        Start custom test
      </button>
    </>
  )
}
