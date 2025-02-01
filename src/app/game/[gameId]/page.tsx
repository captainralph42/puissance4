'use client'

import { supabase } from '@/lib/supabaseClient'
import GameClient from './GameClient'

export default async function GamePage({ params }: { params: { gameId: string } }) {
  const gameNumber = parseInt(params.gameId, 10); 

  if (isNaN(gameNumber)) {
    return <div>Game not found (Invalid ID format)</div>;
  }

  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('game_number', gameNumber)
    .single();

  if (gameError || !gameData) {
    return <div>Game not found</div>;
  }

  const { data: movesData } = await supabase
    .from('moves')
    .select('*')
    .eq('game_id', gameData.id)
    .order('move_number', { ascending: true });

  return (
    <div style={{ padding: 20 }}>
      <h1>Partie Connect4 — Numéro : {gameNumber}</h1>
      <GameClient initialGame={gameData} initialMoves={movesData || []} />
    </div>
  )
}
