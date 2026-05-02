import Link from 'next/link'
import CustomSetBuilder from './components/CustomSetBuilder'
import SetCard from './components/SetCard'
import { SET_MAP } from './lib/types'

export default function HomePage() {
  return (
    <div className="panel-grid">
      <section className="panel">
        <div className="panel-head">
          <h2>Ready-made sets</h2>
        </div>
        <div className="preset-grid">
          {[...SET_MAP.values()].map(set => (
            <SetCard key={set.type} set={set} />
          ))}
        </div>
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
