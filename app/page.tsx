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
        <CustomSetBuilder />
      </section>
    </div>
  )
}
