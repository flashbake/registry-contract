import { NetworkConfig, CONSTANTS } from '@hover-labs/tezos-utils'
import { CONTRACTS } from '@hover-labs/kolibri-js'
import BigNumber from 'bignumber.js'

export const NETWORK_CONFIG: NetworkConfig = {
  name: 'Granada-Testnet',
  tezosNodeUrl: 'rpc.granadanet.teztnets.xyz',
  betterCallDevUrl: 'https://api.better-call.dev/v1',
  requiredConfirmations: 3,
  maxConfirmationPollingRetries: 10,
  operationDelaySecs: 30,

  // The properties below don't matter and is an artifact of using Hover Labs' deploy library
  // TODO(keefertaylor): Generalize this in the @hover-labs/tezos-utils packagage and remove these.
  contracts: CONTRACTS.SANDBOX,
  escrowAmount: 3000000000000000000000,
  governanceVoteLength: 15,
  governanceTimelockLength: 11,
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
}
