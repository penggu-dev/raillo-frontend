import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header/Header'
import Footer from '@/components/layout/Footer'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'
import { THEME_INIT_SCRIPT } from '@/lib/theme'

export const metadata: Metadata = {
  title: 'Raillo',
  description: 'Raillo Project',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <script
          // 첫 페인트 전 테마 적용 (규칙은 lib/theme.ts)
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <ThemeProvider>
          <QueryProvider>
            <div className='min-h-screen bg-background flex flex-col' >
              <Header />
              <main className='flex-1'>{children}</main>
              <Footer />
            </div>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html >
  )
}
