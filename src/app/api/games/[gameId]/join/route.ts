import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params
    const { player2 } = await req.json()

    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single()

    if (gameError || !game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }
    if (game.status !== 'WAITING_FOR_PLAYER2') {
      return NextResponse.json({ error: 'Game not waiting for player2' }, { status: 400 })
    }

    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update({ player2, status: 'IN_PROGRESS' })
      .eq('id', gameId)
      .select()
      .single()

    if (updateError || !updatedGame) {
      return NextResponse.json({ error: updateError?.message }, { status: 400 })
    }

    return NextResponse.json(updatedGame)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
