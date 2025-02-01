import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { checkVictory } from '@/utils/checkVictory'

export async function POST(
  req: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    const { gameId } = params
    const { player, columnPlayed } = await req.json()

    const { data: gameData, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single()

    if (gameError || !gameData) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }
    if (gameData.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Game not in progress' },
        { status: 400 }
      )
    }

    const { data: lastMove } = await supabase
      .from('moves')
      .select('move_number')
      .eq('game_id', gameId)
      .order('move_number', { ascending: false })
      .limit(1)
      .single()

    const nextMoveNumber = lastMove ? lastMove.move_number + 1 : 1

    if (nextMoveNumber % 2 === 1 && player !== gameData.player1) {
      return NextResponse.json(
        { error: 'It is player1’s turn!' },
        { status: 400 }
      )
    }
    if (nextMoveNumber % 2 === 0 && player !== gameData.player2) {
      return NextResponse.json(
        { error: 'It is player2’s turn!' },
        { status: 400 }
      )
    }

    const { data: insertedMove, error: moveError } = await supabase
      .from('moves')
      .insert({
        game_id: gameId,
        move_number: nextMoveNumber,
        player,
        column_played: columnPlayed
      })
      .select()
      .single()

    if (moveError || !insertedMove) {
      return NextResponse.json({ error: moveError?.message }, { status: 400 })
    }

    const { data: allMoves } = await supabase
      .from('moves')
      .select('*')
      .eq('game_id', gameId)
      .order('move_number', { ascending: true })

    const winner = checkVictory(allMoves || [])
    let updatedGame = gameData

    if (winner) {
      const { data: updated, error: updateError } = await supabase
        .from('games')
        .update({
          status: 'FINISHED',
          winner
        })
        .eq('id', gameId)
        .select()
        .single()

      if (!updateError && updated) {
        updatedGame = updated
      }
    }

    return NextResponse.json({
      move: insertedMove,
      allMoves,
      game: updatedGame
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
