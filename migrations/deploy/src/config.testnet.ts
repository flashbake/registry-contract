import { NetworkConfig, CONSTANTS } from '@hover-labs/tezos-utils'
import BigNumber from 'bignumber.js'

export type InitialRegistryData = {
  privateKey: string
  endpoint: string
}

export const NETWORK_CONFIG: NetworkConfig = {
  name: 'Granada-Testnet',
  tezosNodeUrl: 'https://hangzhounet.smartpy.io/',
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
      privateKey: "edsk34DuVDY1wgvYGTLJpUZj4xDrJPiMzMXc7YoKkNXRYETtDHgocm",
      endpoint: "http://tezos-baking-node-0.tezos-baking-node:11732/flashbake/bundle"
    },
    {
      privateKey: "edsk3tJdasZU4x6xtsHuim1e5uamNUyTpHnhJtmbRm4nVmxRFZN8Lt",
      endpoint: "http://tezos-baking-node-1.tezos-baking-node:11732/flashbake/bundle"
    }
  ]
}
