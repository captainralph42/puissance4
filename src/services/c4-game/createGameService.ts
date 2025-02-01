import { CreateC4Game } from '../../../artifacts/ts'
import {
  SignerProvider,
  NULL_CONTRACT_ADDRESS,
  MINIMAL_CONTRACT_DEPOSIT,
  NodeProvider,
  waitForTxConfirmation
} from '@alephium/web3'
import { FACTORY_ID } from './types'
import { supabase } from '@/lib/supabaseClient'

const nodeProvider = new NodeProvider('http://localhost:22973')

async function getNextGameNumber(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('game_number')
      .order('game_number', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return 1;
    }

    return data ? data.game_number + 1 : 1;
  } catch (err) {
    return 1;
  }
}

export async function createGame(
  signer: SignerProvider,
  player1: string
): Promise<{ contractId: string; gameNumber: number }> {
  try {
    const { data: testData, error: testError } = await supabase.from('games').select('*').limit(1);
    if (testError) {
      throw new Error("Erreur de connexion à Supabase.");
    }

    const gameNumber = await getNextGameNumber();

    const result = await CreateC4Game.execute(signer, {
      initialFields: {
        factoryId: FACTORY_ID,
        player1,
        betAmount: 0n,
        player2: NULL_CONTRACT_ADDRESS,
        winner: NULL_CONTRACT_ADDRESS,
        isFinished: false
      },
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT * 2n
    });

    const confirmed = await waitForTxConfirmation(result.txId, 20000, 200);
    if (!confirmed) {
      throw new Error(`Transaction ${result.txId} non confirmée.`);
    }

    const gameData = { game_number: gameNumber, player1, status: 'WAITING_FOR_PLAYER2' };

    const { data, error } = await supabase.from('games').insert([gameData]).select('*');
    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`);
    }

    return {
      contractId: result.txId,
      gameNumber
    }
  } catch (error) {
    throw error;
  }
}