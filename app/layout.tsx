import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Header } from '@/components/header'
import './globals.css'

const geist = Geist({
  subsets: ["latin"],
  variable: '--font-geist-sans'
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono'
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: 'Rizzon Taekwondo Dojang - Championship Excellence',
  description: 'Professional Taekwondo training and championship registration. Join our elite dojang for kyorugi and poomsae competitions.',
  generator: 'v0.app',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground" suppressHydrationWarning>
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
