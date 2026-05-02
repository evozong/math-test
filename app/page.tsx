import Link from 'next/link'
import CustomSetBuilder from './components/CustomSetBuilder'
import PresetGrid from './components/PresetGrid'
import { SET_MAP } from './lib/types'

export default function HomePage() {
  return (
    <div className="panel-grid">
      <section className="panel">
        <PresetGrid sets={[...SET_MAP.values()]} />
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2><Link href="/sets/custom">Build your own!</Link></h2>
        </div>
        <CustomSetBuilder />
      </section>
    </div>
  )
}
