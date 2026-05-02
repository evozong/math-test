import { Suspense } from 'react'
import CustomSetBuilder from './components/CustomSetBuilder'
import ModeToggle from './components/ModeToggle'
import PresetGrid from './components/PresetGrid'
import { SET_MAP } from './lib/types'

export default function HomePage() {
  return (
    <>
      <section>
        <Suspense>
          <ModeToggle />
        </Suspense>
      </section>
      <div className="panel-grid">
        <section className="panel">
          <Suspense>
            <PresetGrid sets={[...SET_MAP.values()]} />
          </Suspense>
        </section>

        <section className="panel">
          <Suspense>
            <CustomSetBuilder />
          </Suspense>
        </section>
      </div>
    </>
  )
}
