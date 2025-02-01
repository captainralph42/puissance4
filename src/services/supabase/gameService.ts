
import { supabase } from '@/lib/supabaseClient'

export type GameRecord = {
  id: string         
  contract_id: string
  player1: string
  player2?: string | null
  status: 'WAITING_FOR_PLAYER2' | 'IN_PROGRESS' | 'FINISHED'
  winner?: string | null
}

export async function createGameRecord(game: GameRecord): Promise<GameRecord> {
  const { data, error } = await supabase
    .from('games')
    .insert(game)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
