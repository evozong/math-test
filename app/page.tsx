import Link from 'next/link'
import CustomSetBuilder from './components/CustomSetBuilder'
import { SET_MAP } from './lib/types'

export default function HomePage() {
  return (
    <div className="panel-grid">
      <section className="panel">
        <div className="panel-head">
          <h2>Ready-made sets</h2>
        </div>
        <div className="preset-grid">
          {[...SET_MAP.values()].map(({ type, name, desc }) => (
            <div key={type} className="card">
              <div>
                <p className="chip">10 questions</p>
                <h3><Link href={`/sets/${type}`}>{name}</Link></h3>
                <p className="muted">{desc}</p>
              </div>
              <div className="card-actions">
                <Link href={`/sets/${type}?autoStart`} className="primary">Start</Link>
                <Link href={`/sets/${type}?mode=stamina&autoStart`} className="ghost">Stamina</Link>
              </div>
            </div>
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
