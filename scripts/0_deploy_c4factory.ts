import { Deployer, DeployFunction, Network } from '@alephium/cli'
import { C4factory } from '../artifacts/ts'

const deployC4factory: DeployFunction = async (
  deployer: Deployer): Promise<void> => {
  
  const c4factory = await deployer.deployContract(C4factory, {

    initialFields: {
      templateId: 'a37e42be665b52dc11ea16dbd1e25dba52591b82d913cf662e806cabdc4a9000',
      totalGames: 0n,
    }
  })
  console.log('c4f contract id: ' + c4factory.contractInstance.contractId)
  console.log('c4f contract address: ' + c4factory.contractInstance.address)
}

export default deployC4factory
