# Deploy Pipeline

This deploys a Flashbake Registry contract.

## Usage

Pre-reqs:
```
# Install typescipt
$ npm i -g typescript

# Install deps
$ npm i

# Get SmartPy
sh <(curl -s https://smartpy.io/releases/20220405-79018120fafa35774b674ec4de0aebd19409219d/cli/install.sh )
```

Prepare a deploy
```
# Remove any stale artifacts
rm -rf src/config.ts deploy-data.json

# Initialize Deployer Key
export DEPLOY_SK=edsk...

# Copy config
# Use config.mainnet.ts for mainnet.
$ cp src/config.testnet.ts src/config.ts

# Run migration
$ ts-node src/flows/migrate.ts
```

Validations (testnet and mainnet):
```
# Validate storage applied as expected
$ ts-node src/verifications/verify-storage.ts
```

Validations (testnet only):
```
# Validate that the administrator can admin the registry.
# NOTE: this step will change bondAmount so it is destructive.
# NOTE: this step will not work on mainnet, since the contract will require many signatures.
$ ts-node src/verifications/verify-administrator.ts
```

Optional: Populate initial data
```
$ ts-node src/flows/initialize.ts
```

Verify data:
```
$ ts-node src/verifications/verify-initial-data.ts
```

Export data for k8:
```
$ ts-node src/flows/export-for-k8.ts
```

See results in `multisig.json`, `registry.json` and `k8-deploy-data.json`.
