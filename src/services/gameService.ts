// services/gameService.ts

import { CreateC4Game } from '../../artifacts/ts'
import { MINIMAL_CONTRACT_DEPOSIT, SignerProvider, NULL_CONTRACT_ADDRESS } from '@alephium/web3'
import { waitForTxConfirmation } from '@alephium/web3'  // ou créer utils/gameUtils.ts si besoin
import { config } from '@/config/networkConfig'

export const createGame = async (
  signer: SignerProvider, 
  account: { address: string },
  betAmount: bigint
): Promise<string> => {
  if (!signer || !account) {
    throw new Error('Informations de signature ou de compte manquantes.')
  }

  try {
    // Exécution de la transaction de création du jeu.
    // On encode les champs immuables et mutables attendus par le contrat.
    const result = await CreateC4Game.execute(signer, {
      initialFields: {
        factoryId: '',
        player1: account.address,
        betAmount: betAmount,
        // Valeurs par défaut pour les champs mutables :
        player2: NULL_CONTRACT_ADDRESS,
        winner: NULL_CONTRACT_ADDRESS,
        isFinished: false
      },
      // Dépôt minimal requis (parfois multiplié par 2 selon la logique de copyCreateContract)
      attoAlphAmount: MINIMAL_CONTRACT_DEPOSIT * 2n
    })

    console.log(`Transaction initiée avec txId : ${result.txId}`)

    // On attend la confirmation de la transaction sur la blockchain
    const confirmed = await waitForTxConfirmation(result.txId, 5000, 50)
    if (!confirmed) {
      throw new Error(`La transaction ${result.txId} n'a pas été confirmée après plusieurs tentatives.`)
    }

    console.log(`Transaction ${result.txId} confirmée.`)
    return result.txId
  } catch (error) {
    console.error('Erreur lors de la création du jeu :', error)
    throw error
  }
}
