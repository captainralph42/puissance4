// app/page.tsx

'use client'

import Link from 'next/link'
import { AlephiumConnectButton } from '@alephium/web3-react'

export default function HomePage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Bienvenue sur mon Puissance 4</h1>
      <AlephiumConnectButton />
      <p>Choisissez une action :</p>

      <ul>
        <li>
          <Link href="/create-game">
            Créer une nouvelle partie
          </Link>
        </li>

      </ul>
    </main>
  )
}
