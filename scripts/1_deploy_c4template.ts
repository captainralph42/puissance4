import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { C4Template } from '../artifacts/ts'
import { NULL_CONTRACT_ADDRESS } from '@alephium/web3'

const deployC4template: DeployFunction = async (
  deployer: Deployer,
): Promise<void> => {
  const c4Template = await deployer.deployContract(C4Template, {
    initialFields: {
      player1: NULL_CONTRACT_ADDRESS,
      betAmount: 0n,
      player2: NULL_CONTRACT_ADDRESS,
      winner: NULL_CONTRACT_ADDRESS,
      isFinished: false
    }
  })
  console.log('C4T contract id: ' + c4Template.contractInstance.contractId)
  console.log('C4T contract address: ' + c4Template.contractInstance.address)
}

export default deployC4template
