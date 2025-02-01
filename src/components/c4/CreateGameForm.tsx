'use client'

import { useState } from 'react'
import { useWallet } from '@alephium/web3-react'
import { createGame } from '@/services/c4-game/createGameService'
import { useRouter } from 'next/navigation'

export default function CreateGameForm() {
  const { account, signer } = useWallet()
  const router = useRouter()

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleCreateGame = async () => {
    try {
      setError(null)
      if (!account || !signer) {
        setError('Veuillez connecter votre wallet Alephium.')
        return
      }

      setLoading(true)
      const { contractId, gameNumber } = await createGame(signer, account.address)
      console.log(`Partie créée - Contract ID: ${contractId}, Numéro: ${gameNumber}`)

      router.push(`/game/${gameNumber}`)
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleCreateGame} disabled={loading}>
        {loading ? 'Création...' : 'Créer une partie Connect4'}
      </button>
    </div>
  )
}
