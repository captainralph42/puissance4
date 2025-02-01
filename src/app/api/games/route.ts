// app/api/games/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: NextRequest) {
  try {
    const { player1 } = await req.json()
    const { data, error } = await supabase
      .from('games')
      .insert({
        player1,
        status: 'WAITING_FOR_PLAYER2'
      })
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: error?.message }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
