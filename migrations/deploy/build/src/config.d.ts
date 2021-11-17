import { NetworkConfig } from '@hover-labs/tezos-utils';
import BigNumber from 'bignumber.js';
export declare const NETWORK_CONFIG: NetworkConfig;
export declare const MIGRATION_CONFIG: {
    bondAmountMutez: BigNumber;
    publicKeys: string[];
    threshold: number;
    timelockSeconds: number;
};
