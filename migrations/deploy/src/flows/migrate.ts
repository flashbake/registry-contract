import { MIGRATION_CONFIG, NETWORK_CONFIG } from "../config"
import { ContractOriginationResult, loadContract, printConfig, sendOperation, getTezos, fetchFromCacheOrRun, deployContract } from "@hover-labs/tezos-utils"
import CACHE_KEYS from '../cache-keys'
import generateMultisigStorage from '../storage/multisig'
import generateRegistryStorage from "../storage/registry"

const main = async () => {
  // Debug Info
  console.log("Deploying")
  printConfig(NETWORK_CONFIG)
  console.log('')

  // Init Deployer
  console.log("Initializing Deployer Account")
  const tezos = await getTezos(NETWORK_CONFIG)
  console.log("Deployer initialized!")
  console.log('')

  // Load Contract Soruces
  console.log("Loading Contracts...")
  const contractSources = {
    multisigContractSource: loadContract(`${__dirname}/../../../../multisig-timelock/smart_contracts/msig-timelock.tz`),
    registryContractSource: loadContract(`${__dirname}/../../../../smart_contracts/registry.tz`),
  }
  console.log("Done!")
  console.log('')

  // Deploy Pipeline

  // Step 0: Deploy a multisig contract
  console.log("Deploying a Multisig Contract")
  const multisigDeployResult: ContractOriginationResult = await fetchFromCacheOrRun(CACHE_KEYS.MULTISIG_DEPLOY, async () => {
    const multisigStorage = generateMultisigStorage(MIGRATION_CONFIG.publicKeys, MIGRATION_CONFIG.threshold, MIGRATION_CONFIG.timelockSeconds)
    return deployContract(NETWORK_CONFIG, tezos, contractSources.multisigContractSource, multisigStorage)
  })
  console.log("")

  // Step 1: Deploy the registry contract
  console.log("Deploying a Registry Contract")
  const registryDeployResult: ContractOriginationResult = await fetchFromCacheOrRun(CACHE_KEYS.REGISTRY_DEPLOY, async () => {
    const registryStorage = generateRegistryStorage(multisigDeployResult.contractAddress, MIGRATION_CONFIG.bondAmountMutez)
    return deployContract(NETWORK_CONFIG, tezos, contractSources.registryContractSource, registryStorage)
  })
  console.log("")

  // Print Results
  console.log("----------------------------------------------------------------------------")
  console.log("Operation Results")
  console.log("----------------------------------------------------------------------------")

  console.log("Contracts:")
  console.log(`Multisig Contract: ${multisigDeployResult.contractAddress} / ${multisigDeployResult.operationHash}`)
  console.log(`Registry Contract: ${registryDeployResult.contractAddress} / ${registryDeployResult.operationHash}`)
  console.log("")
}

main()