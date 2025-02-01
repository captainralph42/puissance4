
import { C4TemplateInstance } from "../../../artifacts/ts";
import { SignerProvider, waitForTxConfirmation } from '@alephium/web3'

export async function addBetAmount(
  signer: SignerProvider,
  contractId: string,
  caller: string,
  betAmount: bigint
): Promise<string> {
  try {
    console.log(`Début addBetAmount - Contrat : ${contractId}, Montant : ${betAmount}`);

    const contractInstance = new C4TemplateInstance(contractId)

    const result = await contractInstance.transact.addBetAmount({
      signer,
      args: {
        caller,
        amount: betAmount
      },
      attoAlphAmount: betAmount
    })

    console.log(`Transaction addBetAmount envoyéeee, txId : ${result.txId}`);

    const confirmed = await waitForTxConfirmation(result.txId, 10000, 100);
    if (!confirmed) {
      throw new Error(`La transaction ${result.txId} n'a pas été confirmée.`);
    }

    console.log(`Transaction addBetAmount ${result.txId} confirmée.`);
    return result.txId
  } catch (error) {
    console.error('Erreur lors de addBetAmount :', error);
    throw error;
  }
}
