import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header/Header'
import Footer from '@/components/layout/Footer'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/toaster'

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
          dangerouslySetInnerHTML={{
            // 첫 페인트 전 테마 적용: 저장값 dark, 또는 light·dark가 아닌 값(없음·system)이면서 운영체제가 다크 모드 (stores/theme-store.ts와 같은 규칙)
            __html: `(function(){try{var t=localStorage.getItem('raillo-theme');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
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
