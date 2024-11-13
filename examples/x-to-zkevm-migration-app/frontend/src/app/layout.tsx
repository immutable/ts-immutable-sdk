import { IMXProvider } from '@/context/imx'
import { PassportProvider } from '@/context/passport'
import { ZkEVMProvider } from '@/context/zkevm'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <IMXProvider>
          <ZkEVMProvider>
            <PassportProvider>
              {children}
            </PassportProvider>
          </ZkEVMProvider>
        </IMXProvider>
      </body>
    </html>
  )
} 