// components/c4/AddBetAmountForm.tsx

'use client'

import { useState } from 'react'
import { useWallet } from '@alephium/web3-react'
import { addBetAmount } from '@/services/c4-game/addBetAmountService'

interface AddBetAmountFormProps {
  contractId: string
}

export default function AddBetAmountForm({ contractId }: AddBetAmountFormProps) {
  const { account, signer } = useWallet()

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [betAmount, setBetAmount] = useState<string>('')
  const [txId, setTxId] = useState<string | null>(null)

  const handleAddBet = async () => {
    try {
      setError(null)
      if (!account || !signer) {
        setError('Veuillez connecter votre wallet Alephium.')
        return
      }
      if (!betAmount || isNaN(Number(betAmount))) {
        setError('Veuillez saisir un montant valide.')
        return
      }

      setLoading(true)
      const bigAmount = BigInt(betAmount)

      const addBetTxId = await addBetAmount(
        signer,
        contractId,
        account.address, // player1
        bigAmount
      )

      setTxId(addBetTxId)
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3>Déposer une mise</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ margin: '10px 0' }}>
        <label>Mise (attoAlph) :</label>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          placeholder="Ex: 1000000000000"
        />
      </div>

      <button onClick={handleAddBet} disabled={loading}>
        {loading ? 'Envoi...' : 'Déposer la mise'}
      </button>

      {txId && (
        <p>Mise déposée avec succès ! TxId: <strong>{txId}</strong></p>
      )}
    </div>
  )
}
