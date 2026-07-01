import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'e-sign — エンベロープ無制限の電子署名SaaS',
  description: 'DocuSignの代替。エンベロープ無制限・自己ホスト可能なオープンソース電子署名SaaS。',
  openGraph: {
    title: 'e-sign — エンベロープ無制限の電子署名SaaS',
    description: 'DocuSignの代替。エンベロープ無制限・自己ホスト可能なOSS電子署名。',
    url: 'https://e-sign.vercel.app',
    siteName: 'e-sign',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
