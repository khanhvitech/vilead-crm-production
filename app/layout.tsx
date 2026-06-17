import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ViLead CRM - Chăm sóc khách hàng thông minh',
  description: 'Hệ thống CRM ViLead giúp quản lý leads, khách hàng và doanh số hiệu quả',
}

import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { GlobalSubscriptionBanner } from './components/GlobalSubscriptionBanner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={inter.className}>
        <SubscriptionProvider>
          <GlobalSubscriptionBanner />
          {children}
          <Toaster />
        </SubscriptionProvider>
      </body>
    </html>
  )
}
