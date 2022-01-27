import {
  ContractOriginationResult,
  fetchFromCache,
  getTezos,
  validateMetadata,
  validateStorageValue
} from "@hover-labs/tezos-utils"
import { TezosToolkit } from "@taquito/taquito"
import { InMemorySigner } from "@taquito/signer"
import CACHE_KEYS from '../cache-keys'
import { MIGRATION_CONFIG, NETWORK_CONFIG } from '../config'

// TODO(keefertaylor): Refactor to tezos-utils
/**
 * Verify the given key in the given map in the given contract has the expected value. 
 * 
 * Validation is done using JSON.stringify.
 * 
 * Throw if the values are not as expected.
 * 
 * @param contractAddress The address of the contract containing the map.
 * @param mapName The name of the map in the contract's storage
 * @param key The key that is expected to be in the map. 
 * @param expectedValue The expected value to check against.
 * @param tezos A TezosToolkit
 */
const validateMapValue = async (
  contractAddress: string,
  mapName: string,
  key: string,
  expectedValue: any,
  tezos: TezosToolkit
) => {
  const contract = await tezos.contract.at(contractAddress)
  const storage: any = await contract.storage()
  const map = storage[mapName]
  const actualValue = await map.get(key)
  if (JSON.stringify(expectedValue) !== JSON.stringify(actualValue)) {
    throw new Error(`Bad map entry!\nExpected: ${expectedValue}\nActual: ${actualValue}`)
  }
}

// TODO(keefertaylor): Refactor to tezos-utils
/**
 * Get a public key hash / address from the given private key.
 * 
 * @param privateKey The private key to derive the address of
 * @returns The address of the private key.
 */
const addressFromPrivateKey = async (privateKey: string): Promise<string> => {
  const signer = await InMemorySigner.fromSecretKey(privateKey)
  return signer.publicKeyHash()
}

const main = async () => {
  console.log("Verifying initial data populated correctly...")
  console.log("")

  // Load deployed contracts
  const tezos = await getTezos(NETWORK_CONFIG)
  const registryContractAddress = (await fetchFromCache(CACHE_KEYS.REGISTRY_DEPLOY) as ContractOriginationResult).contractAddress

  // Verify each is populated correctly
  const initialRegistryData = MIGRATION_CONFIG.initialRegistryData
  for (let i = 0; i < initialRegistryData.length; i++) {
    console.log(`...Verifying Registration ${i + 1} of ${initialRegistryData.length}`)

    // Grab the data to validate
    const registryData = initialRegistryData[i]
    const key = await addressFromPrivateKey(registryData.privateKey)

    // Expected value should be the endpoint and the registration fee.
    const expectedValue = {
      endpointUrl: registryData.endpoint,
      bondAmount: MIGRATION_CONFIG.bondAmountMutez
    }

    await validateMapValue(registryContractAddress, 'registry', key, expectedValue, tezos)
    console.log("   / passed")
  }

  console.log("")
  console.log("All tests pass!")
  console.log("")
}
main()