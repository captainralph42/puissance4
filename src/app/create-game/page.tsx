'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet, AlephiumConnectButton } from '@alephium/web3-react'

export default function CreateGamePage() {
  const router = useRouter()
  const { account } = useWallet()

  const [betAmount, setBetAmount] = useState<string>('100') // par ex. valeur par défaut
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newGameId, setNewGameId] = useState<string | null>(null)

  const createGame = async () => {
    setError(null)
    if (!account) {
      setError('Please connect your Alephium wallet first.')
      return
    }

    try {
      setLoading(true)
      // On appelle l'API locale /api/games
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          player1: account.address,
          betAmount
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error creating game')
      }

      // L'API renvoie { id: newGameId }
      const game = await res.json()
      setNewGameId(game.id)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    if (!newGameId) return
    const shareURL = `${window.location.origin}/game/${newGameId}`
    navigator.clipboard.writeText(shareURL)
      .then(() => alert('Link copied!'))
      .catch(() => alert('Failed to copy link'))
  }

  const goToGame = () => {
    if (newGameId) {
      router.push(`/game/${newGameId}`)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Créer une partie (Player1)</h1>
      <AlephiumConnectButton />
      <p>Wallet: {account ? account.address : 'non connecté'}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <label>Bet Amount (ALPH) :</label><br/>
        <input 
          type="number" 
          value={betAmount} 
          onChange={e => setBetAmount(e.target.value)} 
          disabled={loading || !account}
        />
      </div>

      <br/>

      {!newGameId ? (
        <button onClick={createGame} disabled={loading || !account}>
          {loading ? 'Création...' : 'Créer la partie'}
        </button>
      ) : (
        <>
          <p>Partie créée avec succès !</p>
          <p>Share link : <br/>
            <strong>{`${window.location.origin}/game/${newGameId}`}</strong>
          </p>
          <button onClick={copyLink}>Copier le lien</button>
          {' '}
          <button onClick={goToGame}>Aller à la partie</button>
        </>
      )}
    </div>
  )
}
