'use client'

import NextLink from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { ComponentProps } from 'react'

type Props = ComponentProps<typeof NextLink>

export default function Link({ href, ...props }: Props) {
  const searchParams = useSearchParams()
  const isStamina = searchParams.get('mode') === 'stamina'

  const resolvedHref = (() => {
    if (!isStamina || typeof href !== 'string' || !href.startsWith('/')) return href
    const [path, query] = href.split('?')
    const params = new URLSearchParams(query)
    if (!params.has('mode')) params.set('mode', 'stamina')
    return `${path}?${params}`
  })()

  return <NextLink href={resolvedHref} {...props} />
}
