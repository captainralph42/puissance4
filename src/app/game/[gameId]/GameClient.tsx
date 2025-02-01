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

export default function GameClient({ initialGame, initialMoves }: { initialGame: Game; initialMoves: Move[] }) {
  const [game, setGame] = useState<Game>(initialGame)
  const [moves, setMoves] = useState<Move[]>(initialMoves)
  const [column, setColumn] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const { account } = useWallet()

  useEffect(() => {
    const gamesChannel = supabase.channel('games-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=eq.${game.id}` }, (payload) => {
      if (payload.new) {
        setGame((prev) => ({ ...prev, ...payload.new }))
      }
    }).subscribe()

    const movesChannel = supabase.channel('moves-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'moves', filter: `game_id=eq.${game.id}` }, (payload) => {
      if (payload.eventType === 'INSERT') {
        const newMove = payload.new as Move
        setMoves((prev) => [...prev, newMove].sort((a, b) => a.move_number - b.move_number))
      }
    }).subscribe()

    return () => {
      supabase.removeChannel(gamesChannel)
      supabase.removeChannel(movesChannel)
    }
  }, [game.id])

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
        body: JSON.stringify({ player: account.address, columnPlayed: column })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error)
      }
      setMoves(data.allMoves)
      setGame(data.game)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const board = useMemo(() => {
    const rows = 6
    const cols = 7
    const emptyBoard: string[][] = Array.from({ length: rows }, () => Array(cols).fill(''))
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

  return (
    <div>
      <AlephiumConnectButton />
      Wallet: {account ? account.address : 'non connecté'}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Status: {game.status}</p>
      <p>Player1: {game.player1}</p>
      <p>Player2: {game.player2 || '(pas encore de joueur2)'} </p>
      {game.winner && <p>Winner: {game.winner}</p>}
      {game.status === 'WAITING_FOR_PLAYER2' && !game.player2 && <button onClick={joinAsPlayer2}>Join as Player2</button>}
      {game.status === 'IN_PROGRESS' && (
        <div>
          <label>
            Col (0–6) : <input type="number" min={0} max={6} value={column} onChange={(e) => setColumn(Number(e.target.value))} />
          </label>
          <button onClick={playMove}>Play Move</button>
        </div>
      )}
      <div className={styles.boardContainer}>
        {board.map((row, rowIndex) =>
          row.map((cellValue, colIndex) => {
            const cellClass = getCellClass(cellValue)
            return <div key={`${rowIndex}-${colIndex}`} className={`${styles.cell} ${cellClass}`} />
          })
        )}
      </div>
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
