# Flashbake Smart Contracts

This repository contains an on-chain registry for Flashbake Bakers.

Project structure / TODOs:
- `.github/`: TODO
- `smart_contracts/`: Smart contract code
- `multisig-timelock/`: TODO
- `migrations/`: TODO

## Introduction

To register for Flashbake, we implement an on-chain registration mechanism where bakers voluntarily submit their endpoint URL. This contract allows bakers to publicly advertise their Flashbake compatibility.

The smart contract is a simple registry, which includes a bond amount (denominated in mutez) that Bakers must escrow in order to register. The bond amount is a spam prevention measure, and returned to the baker when they unregister.

An "administrator" contract can govern the bond amount to account for changing market conditions. The administrator contract is initially implemented as the [Hover Labs Multisignature Contract](https://github.com/hover-labs/multisig-timelock), as the Flashbake team has extensive experience and tooling built aroud the contract already. Initially, it is proposed that this contract is held by the FlashBake team, but a rotation feature allows the administrator to be set to a new multisig contract, a DAO contract, a null address or any other valid implicit or smart contract address over time.

Importantly, this contract is trustless. The governor contract cannot steal any funds from any baker.

## Specification

The following fields are in contract storage:
```
# The address of the administrator contract
address %administratorContract

# The amount of bond required on new registrations
mutez %bondAmount

# A list of registered Flashbake bakers.
# Key is the public key hash of the baker
# Value is a pair with two components: 
# (1) string representing the baker's flashbake endpoint
# (2) amount of bond owed to the baker when they unregister.
big_map address Pair(string, mutez)
```

The contract implements the following entrypoints
```
# Register a baker for FlashBaking the sending address
# Must be sent with `bondAmount` of XTZ
#
# Fails with BAD_BOND_AMOUNT if the required bond is not sent.
# Fails with BAD_PARAM if the baker is already registered.
register(string %endpointUrl)

# Unregister a baker from Flashbaking from the sending address
# Return registry[sender].bondAmount to the sending address
#
# Fails with BAD_PARAM if the baker is not registered.
# Fails with AMOUNT_NOT_ALLOWED if XTZ was attached to the request.
unregister(unit)

# Set the administrator of this contract contract.
# May only be called by the administrator contract.
#
# Fails with BAD_SENDER if the sender is not the administrator.
# Fails with AMOUNT_NOT_ALLOWED if XTZ was attached to the request.
setAdministratorAddress(address %newAdministratorAddress)

# Set the bond amount for new registrations.
# May only be called by the administrator contract.
#
# Fails with BAD_SENDER if the sender is not the administrator.
# Fails with AMOUNT_NOT_ALLOWED if XTZ was attached to the request.
setBondAmount(mutez %newBondAmount)
```

## Development

Get SmartPy:
```
make install-smartpy
```

Test and compile
```
make test-registry
make compile-registry
```
