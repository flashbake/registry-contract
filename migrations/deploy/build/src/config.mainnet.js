"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIGRATION_CONFIG = exports.NETWORK_CONFIG = void 0;
const tezos_utils_1 = require("@hover-labs/tezos-utils");
const kolibri_js_1 = require("@hover-labs/kolibri-js");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
exports.NETWORK_CONFIG = {
    name: 'Mainnet',
    tezosNodeUrl: 'https://rpc.tzbeta.net/',
    betterCallDevUrl: 'https://api.better-call.dev/v1',
    requiredConfirmations: 3,
    maxConfirmationPollingRetries: 10,
    operationDelaySecs: 45,
    contracts: kolibri_js_1.CONTRACTS.SANDBOX,
    escrowAmount: 3000000000000000000000,
    governanceVoteLength: 15,
    governanceTimelockLength: 11,
};
exports.MIGRATION_CONFIG = {
    bondAmountMutez: new bignumber_js_1.default(50).times(new bignumber_js_1.default(tezos_utils_1.CONSTANTS.XTZ_MANTISSA)),
    publicKeys: [
        "edpkvGfYw3LyB1UcCahKQk4rF2tvbMUk8GFiTuMjL75uGXrpvKXhjn",
    ],
    threshold: 1,
    timelockSeconds: 0,
};
//# sourceMappingURL=config.mainnet.js.map