import TestRunner from '../../components/TestRunner'
import CustomSetBuilder from '../../components/CustomSetBuilder'
import { SET_MAP } from '../../lib/types'
import type { TestConfig, QuestionType } from '../../lib/types'

export default async function CustomPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const raw = sp.i
  const values = raw ? (Array.isArray(raw) ? raw : [raw]) : []
  const types = values.filter((v): v is QuestionType => SET_MAP.has(v as QuestionType))

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
  return <TestRunner config={config} autoStart={'autoStart' in sp} />
}
