import { notFound } from 'next/navigation'
import TestRunner from '../../components/TestRunner'
import { SET_MAP } from '../../lib/types'
import type { QuestionType } from '../../lib/types'

export default async function SetPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { slug } = await params
  const sp = await searchParams
  const shouldAutoStart = 'autoStart' in sp

  const set = SET_MAP.get(slug as QuestionType)
  if (!set) notFound()

  const config = { id: set.type, name: set.name, types: [set.type] }
  return <TestRunner config={config} autoStart={shouldAutoStart} />
}
