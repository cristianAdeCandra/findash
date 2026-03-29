import type { Metadata } from 'next'
import { Space_Grotesk, DM_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  weight: ['300','400','500','600','700'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400','500'],
})

export const metadata: Metadata = {
  title: 'FinTrack — Pencatat Keuangan & Investasi',
  description: 'Lacak pengeluaran, investasi, dan target tabunganmu dalam satu tempat.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${dmMono.variable}`}>
      <body>
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#18181f',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0f0f5',
              fontFamily: 'var(--font-space)',
            },
          }}
        />
      </body>
    </html>
  )
}
