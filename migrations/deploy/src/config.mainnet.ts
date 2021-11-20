import { NetworkConfig, CONSTANTS } from '@hover-labs/tezos-utils'
import { CONTRACTS } from '@hover-labs/kolibri-js'
import BigNumber from 'bignumber.js'

export const NETWORK_CONFIG: NetworkConfig = {
  name: 'Mainnet',
  tezosNodeUrl: 'https://rpc.tzbeta.net/',
  betterCallDevUrl: 'https://api.better-call.dev/v1',
  requiredConfirmations: 3,
  maxConfirmationPollingRetries: 10,
  operationDelaySecs: 45,
}

export const MIGRATION_CONFIG = {
  // Initial Bond Amount
  bondAmountMutez: new BigNumber(50).times(new BigNumber(CONSTANTS.XTZ_MANTISSA)), // 50 XTZ

  // Multisig Config
  publicKeys: [
    "edpkvGfYw3LyB1UcCahKQk4rF2tvbMUk8GFiTuMjL75uGXrpvKXhjn", // Alice in Sandbox, tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb
  ],
  threshold: 1,
  timelockSeconds: 0,
}
