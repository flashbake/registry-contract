import {
  ContractOriginationResult,
  callThroughMultisig,
  fetchFromCache,
  getTezos,
  validateStorageValue,
} from "@hover-labs/tezos-utils"
import CACHE_KEYS from '../cache-keys'
import { NETWORK_CONFIG } from '../config'

const main = async () => {
  console.log("Validating that the administrator can control the registry")
  console.log("")

  // Load deployed contracts
  const tezos = await getTezos(NETWORK_CONFIG)
  const multisigContractAddress = (await fetchFromCache(CACHE_KEYS.MULTISIG_DEPLOY) as ContractOriginationResult).contractAddress
  const registryContractAddress = (await fetchFromCache(CACHE_KEYS.REGISTRY_DEPLOY) as ContractOriginationResult).contractAddress

  // Call through the multisig to set the new bond amount.
  const newBondAmount = "123456789"
  await callThroughMultisig(
    NETWORK_CONFIG,
    multisigContractAddress,
    registryContractAddress,
    'setBondAmount',
    `sp.mutez(${newBondAmount})`,
    tezos
  )

  // Verify the bond amount changed
  await validateStorageValue(registryContractAddress, 'bondAmount', newBondAmount, tezos)

  console.log("   / passed")
  console.log("")

  console.log("All tests pass!")
  console.log("")
}
main()