import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import ModeToggle from '../../components/ModeToggle'
import TestRunner from '../../components/TestRunner'
import { SET_MAP } from '../../lib/types'
import type { QuestionType } from '../../lib/types'

export function generateStaticParams() {
  return [...SET_MAP.keys()].map(type => ({ slug: type }))
}

export default async function SetPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const set = SET_MAP.get(slug as QuestionType)
  if (!set) notFound()

  const config = { id: set.type, name: set.name, types: [set.type] }
  return (
    <>
      <section>
        <Suspense><ModeToggle /></Suspense>
      </section>
      <Suspense><TestRunner config={config} /></Suspense>
    </>
  )
}
