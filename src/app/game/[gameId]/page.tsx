// app/game/[gameId]/page.tsx
import { supabase } from '@/lib/supabaseClient'
import GameClient from './GameClient'

export default async function GamePage({
  params
}: {
  params: { gameId: string }
}) {
  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('id', params.gameId)
    .single()

  if (gameError || !gameData) {
    return <div>Game not found</div>
  }

  const { data: movesData } = await supabase
    .from('moves')
    .select('*')
    .eq('game_id', params.gameId)
    .order('move_number', { ascending: true })

  return (
    <div style={{ padding: 20 }}>
      <GameClient
        initialGame={gameData}
        initialMoves={movesData || []}
      />
    </div>
  )
}
