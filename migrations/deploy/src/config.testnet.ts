import { NetworkConfig, CONSTANTS } from '@hover-labs/tezos-utils'
import BigNumber from 'bignumber.js'

export type InitialRegistryData = {
  privateKey: string
  endpoint: string
}

export const NETWORK_CONFIG: NetworkConfig = {
  name: 'Granada-Testnet',
  tezosNodeUrl: 'https://rpc.ithacanet.teztnets.xyz/',
  betterCallDevUrl: 'https://api.better-call.dev/v1',
  requiredConfirmations: 3,
  maxConfirmationPollingRetries: 10,
  operationDelaySecs: 120, // Testnet seems to sporadically produce blocks
}

// Documentation for keys below: https://tezos.gitlab.io/flextesa/
export const MIGRATION_CONFIG = {
  // Initial Bond Amount
  bondAmountMutez: new BigNumber(1).times(new BigNumber(CONSTANTS.XTZ_MANTISSA)), // 1 XTZ

  // Multisig Config
  publicKeys: [
    "edpkvGfYw3LyB1UcCahKQk4rF2tvbMUk8GFiTuMjL75uGXrpvKXhjn", // Alice in Sandbox, tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb
  ],
  threshold: 1,
  timelockSeconds: 0,

  // Initial Registry Data
  initialRegistryData: [
    {
      //# tz1fboti4soXCzGKXK5WfEEpHxPi59WoRoQY
      privateKey: "edsk3E2YCb56fN9TiHL5JRR6xNXrBcWt35fSSEmz3Qh2KR9CgjJD1s",
      endpoint: "http://flashbake-baker-0.flashbake-baker:11732/flashbake/bundle"
    },
    {
      // tz1fb1RzVWyrkPb6BBWR7D1hf3GyWzGifraf
      privateKey: "edsk2iAy5Ldv4pSGMa6xhfZpteYrbVVNrUqeQRW2wQuVFCdeovGWNy",
      endpoint: "http://flashbake-baker-1.flashbake-baker:11732/flashbake/bundle"
    }
  ]
}
