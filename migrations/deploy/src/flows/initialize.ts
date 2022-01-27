import { MIGRATION_CONFIG, NETWORK_CONFIG, InitialRegistryData } from "../config"
import { ContractOriginationResult, loadContract, printConfig, sendOperation, setSigner, getTezos, fetchFromCacheOrRun, fetchFromCache, getSigner, checkConfirmed } from "@hover-labs/tezos-utils"
import CACHE_KEYS from '../cache-keys'

// Result of a registration
type RegistrationResult = {
  address: string
  operationHash: string
}

const main = async () => {
  // Debug Info
  console.log("Initializing Contracts")
  printConfig(NETWORK_CONFIG)
  console.log('')

  // Init Deployer
  console.log("Initializing Deployer Account")
  const tezos = await getTezos(NETWORK_CONFIG)
  console.log("Deployer initialized!")
  console.log('')

  // Load artifacts
  const registryContractAddress = (await fetchFromCache(CACHE_KEYS.REGISTRY_DEPLOY) as ContractOriginationResult).contractAddress

  // Load configuration
  const initialRegistryData: Array<InitialRegistryData> = MIGRATION_CONFIG.initialRegistryData

  // Add initial data to the registry 
  console.log(`Adding ${initialRegistryData.length} entries to the registry...`)
  console.log("")
  const registrationResults: Array<RegistrationResult> = []
  for (let i = 0; i < initialRegistryData.length; i++) {
    // Grab registration data
    const registryData = initialRegistryData[i]

    // Load a deployer
    setSigner(registryData.privateKey, tezos)
    const signerAddress = await tezos.signer.publicKeyHash()
    console.log(`...Registering baker ${signerAddress} with endpoint: ${registryData.endpoint}`)

    // Send an operation 
    const result: RegistrationResult = await fetchFromCacheOrRun(`${signerAddress}-register`, async () => {
      const registerHash = await sendOperation(
        NETWORK_CONFIG,
        tezos,
        registryContractAddress,
        'register',
        registryData.endpoint,
        MIGRATION_CONFIG.bondAmountMutez.toNumber()
      )

      const result: RegistrationResult = {
        address: signerAddress,
        operationHash: registerHash!
      }
      return result
    })

    // Push to results
    registrationResults.push(result)

    console.log("...Registration complete")
    console.log("")
  }
  console.log("All registrations processed.")
  console.log("")

  // Print Results
  console.log("----------------------------------------------------------------------------")
  console.log("Operation Results")
  console.log("----------------------------------------------------------------------------")

  console.log("Registrations:")
  registrationResults.forEach((result) => {
    console.log(`- Register ${result.address}: ${result.operationHash}`)
  })
  console.log("")
}

main()