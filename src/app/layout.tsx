// app/layout.tsx
'use client'

import './globals.css'
import { AlephiumWalletProvider } from '@alephium/web3-react'

import { NodeProvider, web3 } from '@alephium/web3'

const localNodeUrl = 'http://localhost:22973'

const nodeProvider = new NodeProvider(localNodeUrl)
web3.setCurrentNodeProvider(nodeProvider)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AlephiumWalletProvider network={'devnet'} >
          {children}
        </AlephiumWalletProvider>
      </body>
    </html>
  )
}
