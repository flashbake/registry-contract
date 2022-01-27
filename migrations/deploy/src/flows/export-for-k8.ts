import CACHE_KEYS from "../cache-keys"
import { fetchFromCache, ContractOriginationResult, NetworkConfig, getTezos } from '@hover-labs/tezos-utils'
import { NETWORK_CONFIG } from '../config'
import axios from 'axios'
import fs from 'fs'

// Expected addresses of contracts in K8
const EXPECTED_MULTISIG_ADDRESS = 'MULTISIG_ADDR'
const EXPECTED_REGISTRY_ADDRESS = 'REGISTRY_ADDR'

// Configuration for a K8 contract
type k8Config = {
  amount: string,
  delegate: string | null,
  script: Script
}

// Script of a conttract.
type Script = {
  code: Array<object>
  strorage: object
}

// Directory to write artifacts to
const DIR = './artifacts'

const main = async () => {
  console.log("Exporting contract state...")

  // Load tezos
  const tezos = await getTezos(NETWORK_CONFIG)

  // Load artifacts
  const registryContractAddress = (await fetchFromCache(CACHE_KEYS.REGISTRY_DEPLOY) as ContractOriginationResult).contractAddress
  const multisigContractAddress = (await fetchFromCache(CACHE_KEYS.MULTISIG_DEPLOY) as ContractOriginationResult).contractAddress

  // Get registry contract data
  console.log(`...Exporting state of Registry contract at ${registryContractAddress}`)
  const registryBalance = await tezos.tz.getBalance(registryContractAddress)
  const registryDelegate = await tezos.tz.getDelegate(registryContractAddress) ?? ""
  const registryContractData: k8Config = {
    amount: registryBalance.toFixed(),
    delegate: registryDelegate,
    script: await getScript(registryContractAddress, NETWORK_CONFIG),
  }
  const registryFileName = `${DIR}/registry.json`
  fs.writeFileSync(registryFileName, JSON.stringify(registryContractData))
  console.log(`...Wrote state to ${registryFileName}`)
  console.log(``)

  // Get registry contract data
  console.log(`...Exporting state of Multisig contract at ${multisigContractAddress}`)
  const multisigBalance = await tezos.tz.getBalance(multisigContractAddress)
  const multisigDelegate = await tezos.tz.getDelegate(multisigContractAddress) ?? ""
  const multisigContractData: k8Config = {
    amount: multisigBalance.toFixed(),
    delegate: multisigDelegate,
    script: await getScript(multisigContractAddress, NETWORK_CONFIG),
  }
  const multisigFileName = `${DIR}/multisig.json`
  fs.writeFileSync(multisigFileName, JSON.stringify(multisigContractData))
  console.log(`...Wrote state to ${multisigFileName}`)
  console.log(``)

  // Swizzle values into the deploy data.json file
  console.log("...Rewriting cache file")
  const cacheData: any = JSON.parse(fs.readFileSync('deploy-data.json', 'utf-8'))
  cacheData[CACHE_KEYS.MULTISIG_DEPLOY].contractAddress = EXPECTED_MULTISIG_ADDRESS
  cacheData[CACHE_KEYS.REGISTRY_DEPLOY].contractAddress = EXPECTED_REGISTRY_ADDRESS
  const swizzledCacheFileName = `${DIR}/k8-deploy-data.json`
  fs.writeFileSync(swizzledCacheFileName, JSON.stringify(cacheData))
  console.log(`...Wrote modified cache to ${swizzledCacheFileName}`)
  console.log("")

  console.log("All done!")
}

const getScript = async (contractAddress: string, networkConfig: NetworkConfig): Promise<Script> => {
  const url = `${networkConfig.tezosNodeUrl}/chains/main/blocks/head/context/contracts/${contractAddress}/script`
  return (await axios.get(url)).data
}

main()