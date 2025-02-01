// app/layout.tsx
import './globals.css'
import { AlephiumWalletProvider } from '@alephium/web3-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Puissance4 on Alephium',
  description: '...',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AlephiumWalletProvider network={'testnet'} >
          {children}
        </AlephiumWalletProvider>
      </body>
    </html>
  )
}
