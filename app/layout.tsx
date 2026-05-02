import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from './components/Link'
import './globals.css'
import './App.css'

export const metadata: Metadata = {
  title: 'Math Drills',
  icons: { icon: '/favicon-microsite-64.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="hero">
            <div>
              <Suspense>
                <Link href="/" className="hero-link">
                  <h1>Math Drills</h1>
                </Link>
              </Suspense>
            </div>
            <div className="drill-art">
              <img src="/assets/jackhammer.png" alt="Illustration of a floor drill tool" />
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  )
}
