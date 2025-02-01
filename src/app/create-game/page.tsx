'use client'

import { AlephiumConnectButton } from '@alephium/web3-react'
import CreateGameForm from '@/components/c4/CreateGameForm'

export default function CreateGamePage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Créer une partie (Player1)</h1>
      <AlephiumConnectButton />
      <CreateGameForm />
    </div>
  )
}
