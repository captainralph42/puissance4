import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { C4factory } from '../artifacts/ts'

const deployC4factory: DeployFunction = async (
  deployer: Deployer): Promise<void> => {
  
  const c4factory = await deployer.deployContract(C4factory, {

    initialFields: {
      templateId: 'a25bb631b6fc48f1c2a94bb00ac81dfd4e3ad9f6c32610503851deee21b92d00',
      totalGames: 0n,
    }
  })
  console.log('c4f contract id: ' + c4factory.contractInstance.contractId)
  console.log('c4f contract address: ' + c4factory.contractInstance.address)
}

export default deployC4factory
