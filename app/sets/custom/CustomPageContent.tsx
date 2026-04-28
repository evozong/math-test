'use client'

import { useSearchParams } from 'next/navigation'
import TestRunner from '../../components/TestRunner'
import CustomSetBuilder from '../../components/CustomSetBuilder'
import { SET_MAP } from '../../lib/types'
import type { TestConfig, QuestionType } from '../../lib/types'

export default function CustomPageContent() {
  const searchParams = useSearchParams()
  const types = searchParams.getAll('i').filter((v): v is QuestionType => SET_MAP.has(v as QuestionType))

  if (types.length === 0) {
    return (
      <div className="panel-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>Build your own!</h2>
          </div>
          <CustomSetBuilder />
        </section>
      </div>
    )
  }

  const config: TestConfig = { id: 'custom', name: 'Custom Mix', types }
  return <TestRunner config={config} />
}
