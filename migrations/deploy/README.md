# Deploy Pipeline

This deploys a Flashbake Registry contract.

Usage:
```
# Install typescipt
$ npm i -g typescript

# Install deps
$ npm i

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