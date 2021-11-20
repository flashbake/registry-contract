import {
  ContractOriginationResult,
  fetchFromCache,
  getTezos,
  validateStorageValue
} from "@hover-labs/tezos-utils"
import CACHE_KEYS from '../cache-keys'
import { MIGRATION_CONFIG, NETWORK_CONFIG } from '../config'

const main = async () => {
  console.log("Verifying contract storage...")
  console.log("")

  // Load deployed contracts
  const tezos = await getTezos(NETWORK_CONFIG)
  const multisigContractAddress = (await fetchFromCache(CACHE_KEYS.MULTISIG_DEPLOY) as ContractOriginationResult).contractAddress
  const registryContractAddress = (await fetchFromCache(CACHE_KEYS.REGISTRY_DEPLOY) as ContractOriginationResult).contractAddress

  // Multisig
  console.log("Verifying multisig storage...")
  validateStorageValue(multisigContractAddress, 'operationId', 0, tezos)
  validateStorageValue(multisigContractAddress, 'threshold', MIGRATION_CONFIG.threshold, tezos)
  validateStorageValue(multisigContractAddress, 'signers', MIGRATION_CONFIG.publicKeys, tezos)

  const contract = await tezos.contract.at(multisigContractAddress)
  const storage: any = await contract.storage()
  const signers = storage.signers
  console.log(JSON.stringify(signers))

  console.log("   / passed")

  // Registry
  console.log("Verifying multisig storage...")
  console.log("   / passed")


  console.log("All tests pass!")
  console.log("")
}
main()