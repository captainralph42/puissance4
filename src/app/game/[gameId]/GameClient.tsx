'use client'
import { useEffect, useState, useMemo } from 'react'
import { AlephiumConnectButton, useWallet } from '@alephium/web3-react'
import { supabase } from '@/lib/supabaseClient'
import styles from './GameClient.module.css'

type Game = {
  id: string
  player1: string
  player2: string | null
  status: 'WAITING_FOR_PLAYER2' | 'IN_PROGRESS' | 'FINISHED'
  winner: string | null
}

type Move = {
  id: number
  game_id: string
  move_number: number
  player: string
  column_played: number
}

export default function GameClient({
  initialGame,
  initialMoves
}: {
  initialGame: Game
  initialMoves: Move[]
}) {
  const [game, setGame] = useState<Game>(initialGame)
  const [moves, setMoves] = useState<Move[]>(initialMoves)
  const [column, setColumn] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Hook Alephium
  const { account } = useWallet()

  // -----------------------------------
  // 1) Realtime subscription
  // -----------------------------------
  useEffect(() => {
    // -- Channel pour la table 'games' --
    const gamesChannel = supabase
      .channel('games-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${game.id}`
        },
        (payload) => {
          // payload.new contient la row mise à jour
          console.log('games-changes:', payload)
          if (payload.new) {
            setGame((prev) => ({ ...prev, ...payload.new }))
          }
        }
      )
      .subscribe()

    // -- Channel pour la table 'moves' --
    const movesChannel = supabase
      .channel('moves-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'moves',
          filter: `game_id=eq.${game.id}`
        },
        (payload) => {
          console.log('moves-changes:', payload)
          // on peut re-fetch la liste complète, ou juste insérer localement
          if (payload.eventType === 'INSERT') {
            // payload.new => le nouveau move
            const newMove = payload.new as Move
            setMoves((prev) => [...prev, newMove].sort((a,b) => a.move_number - b.move_number))
          }
          // si besoin de gérer un update ou delete, c'est ici
        }
      )
      .subscribe()

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(gamesChannel)
      supabase.removeChannel(movesChannel)
    }
  }, [game.id])

  // -----------------------------------
  // 2) Join as player2
  // -----------------------------------
  const joinAsPlayer2 = async () => {
    if (!account) {
      setError('Connect your wallet first')
      return
    }
    try {
      const res = await fetch(`/api/games/${game.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player2: account.address })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error join')
      }
      const updatedGame = await res.json()
      setGame(updatedGame)
    } catch (err: any) {
      setError(err.message)
    }
  }

  // -----------------------------------
  // 3) Play move
  // -----------------------------------
  const playMove = async () => {
    setError(null)
    if (!account) {
      setError('Connect your wallet first')
      return
    }
    try {
      const res = await fetch(`/api/games/${game.id}/play-move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player: account.address,
          columnPlayed: column
        })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error)
      }
      // Normalement, on n’a pas besoin de setMoves() => on reçoit un event Realtime
      // Mais on peut mettre à jour localement pour être plus réactif
      setMoves(data.allMoves)
      setGame(data.game)
    } catch (err: any) {
      setError(err.message)
    }
  }

  // -----------------------------------
  // 4) Construire le plateau 6x7
  // -----------------------------------
  const board = useMemo(() => {
    const rows = 6
    const cols = 7
    const emptyBoard: string[][] = Array.from({ length: rows }, () =>
      Array(cols).fill('')
    )

    for (const move of moves) {
      const col = move.column_played
      for (let row = rows - 1; row >= 0; row--) {
        if (!emptyBoard[row][col]) {
          emptyBoard[row][col] = move.player
          break
        }
      }
    }
    return emptyBoard
  }, [moves])

  const getCellClass = (cellValue: string) => {
    if (!cellValue) return ''
    if (cellValue === game.player1) return styles.red
    if (cellValue === game.player2) return styles.yellow
    return ''
  }

  // -----------------------------------
  // RENDU
  // -----------------------------------
  return (
    <div>
      <AlephiumConnectButton />
      Wallet: {account ? account.address : 'non connecté'}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <p>Status: {game.status}</p>
      <p>Player1: {game.player1}</p>
      <p>Player2: {game.player2 || '(pas encore de joueur2)'} </p>
      {game.winner && <p>Winner: {game.winner}</p>}

      {/* JOIN si besoin */}
      {game.status === 'WAITING_FOR_PLAYER2' && !game.player2 && (
        <button onClick={joinAsPlayer2}>Join as Player2</button>
      )}

      {/* Jouer un coup si IN_PROGRESS */}
      {game.status === 'IN_PROGRESS' && (
        <div style={{ marginBottom: '1em' }}>
          <label>
            Col (0–6) :{' '}
            <input
              type="number"
              min={0}
              max={6}
              value={column}
              onChange={(e) => setColumn(Number(e.target.value))}
            />
          </label>
          <button onClick={playMove}>Play Move</button>
        </div>
      )}

      {/* Affichage du plateau */}
      <div className={styles.boardContainer}>
        {board.map((row, rowIndex) =>
          row.map((cellValue, colIndex) => {
            const cellClass = getCellClass(cellValue)
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`${styles.cell} ${cellClass}`}
              />
            )
          })
        )}
      </div>

      {/* Historique moves */}
      <ul>
        {moves.map((m) => (
          <li key={m.id}>
            # {m.move_number} - {m.player} → col {m.column_played}
          </li>
        ))}
      </ul>
    </div>
  )
}
