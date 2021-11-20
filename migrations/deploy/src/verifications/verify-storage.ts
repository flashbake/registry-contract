import {
  ContractOriginationResult,
  fetchFromCache,
  getTezos,
  validateMetadata,
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
  // 1) operationId should start at 0
  // 2) threshold, signers and timelockSeconds shoudl match the MIGRATION_CONFIG
  console.log("Verifying multisig storage...")

  await validateStorageValue(multisigContractAddress, 'operationId', 0, tezos)

  await validateStorageValue(multisigContractAddress, 'threshold', MIGRATION_CONFIG.threshold, tezos)
  await validateStorageValue(multisigContractAddress, 'signers', MIGRATION_CONFIG.publicKeys, tezos)
  await validateStorageValue(multisigContractAddress, 'timelockSeconds', MIGRATION_CONFIG.timelockSeconds, tezos)

  console.log("   / passed")

  // Registry
  // 1) administratorAddress should be the multisig
  // 2) bondAmount should match the MIGRATION_CONFIG
  // 3) validate metadata is parseable and print to screen.
  console.log("Verifying multisig storage...")

  await validateStorageValue(registryContractAddress, 'administratorAddress', multisigContractAddress, tezos)

  await validateStorageValue(registryContractAddress, 'bondAmount', MIGRATION_CONFIG.bondAmountMutez, tezos)

  console.log("")
  await validateMetadata(registryContractAddress, tezos)

  console.log("   / passed")

  console.log("All tests pass!")
  console.log("")
}
main()