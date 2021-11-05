####################################################################################
# Implements the Flashbake Registry Contract
#
# The smart contract is a simple registry, which includes a bond amount (denominated 
# in mutez) that Bakers must escrow in order to register. The bond amount is a spam 
# prevention measure, and returned to the baker when they unregister.
#
# An “governor” contract can govern the bond amount to account for changing market 
# conditions. The governor contract should be the Hover Labs Multisignature Contract,
# as the Flashbake team has extensive experience and tooling built aroud the
# contract already. Initially, it is proposed that this contract is held by the 
# FlashBake team, but a rotation feature allows the governor to be set to a new 
# multisig contract, a DAO contract, a null address or any other valid implicit or 
# smart contract address over time.
#
# Importantly, this contract is trustless. The governor contract cannot steal any 
# funds from any baker.
####################################################################################

import smartpy as sp
import json

Addresses = sp.io.import_script_from_url("file:./smart_contracts/helpers/addresses.py")
Errors = sp.io.import_script_from_url("file:./smart_contracts/helpers/errors.py")

####################################################################################
# Types
####################################################################################

# An entry in the registry. 
#
# endpointUrl (string): The endpoint for the flashbake baker
# bondAmount (mutez): The amount of mutez that was locked for this baker to become bonded
REGISTRY_VALUE_TYPE = sp.TRecord(
  endpointUrl = sp.TString,
  bondAmount = sp.TMutez,
).layout(("endpointUrl", "bondAmount"))

####################################################################################
# Metadata
####################################################################################

METADATA = {
    "name"          : "Flashbake Registry",
    "description"   : "Registry for Bakers who want to participate in Flashbake",
    "authors"       : [
        "TODO"
    ],
    "homepage"      : "TODO",
}

####################################################################################
# Implementation
####################################################################################

# Params:
# - administratorAddress (address): The administrator who can change bond requirements
# - bondAmount (mutez): The amount of XTZ required to be locked when registering.
# - registry (big_map<address, REGISTRY_VALUE_TYPE>): A map of baker addresses to their registry data
class FlashBakeRegistry(sp.Contract):
  def __init__(
    self, 
    administratorAddress = Addresses.ADMINISTRATOR_ADDRESS,
    bondAmount = sp.mutez(0),      
    registry = sp.big_map(
      l = {},
      tkey = sp.TAddress,
      tvalue = REGISTRY_VALUE_TYPE,
    )
  ):
    # Configure metadata
    metadata_data = sp.utils.bytes_of_string(json.dumps(METADATA))
    metadata = sp.big_map(
        l = {
            "": sp.utils.bytes_of_string("tezos-storage:data"),
            "data": metadata_data
        },
        tkey = sp.TString,
        tvalue = sp.TBytes            
    )

    self.init(
      administratorAddress = administratorAddress,
      bondAmount = bondAmount,
      registry = registry,
      metadata = metadata,
    )

  ####################################################################################
  # Registration Entrypoints
  ####################################################################################
  
  # Register a baker for FlashBaking the sending address
  # Must be sent with `bondAmount` of XTZ
  #
  # Fails with BAD_BOND_AMOUNT if the required bond is not sent.
  # Fails with BAD_PARAM if the baker is already registered.
  @sp.entry_point	
  def register(self, param):
    sp.set_type(param, sp.TRecord(endpointUrl = sp.TString).layout("endpointUrl"))

    baker = sp.sender
    bondAmount = sp.amount

    # Validate bond amount was sent.
    sp.verify(bondAmount == self.data.bondAmount, Errors.BAD_BOND_AMOUNT)

    # Validate the baker isn't already set
    sp.verify(~self.data.registry.contains(baker), Errors.BAD_PARAM)

    # Insert into registry
    registryValue = sp.record(
      endpointUrl = param.endpointUrl,
      bondAmount = bondAmount
    )
    sp.set_type(registryValue, REGISTRY_VALUE_TYPE)
    self.data.registry[baker] = registryValue

  # Unregister a baker from Flashbaking from the sending address
  # Return registry[sender].bondAmount to the sending address
  #
  # Fails with BAD_PARAM if the baker is not registered.
  # Fails with AMOUNT_NOT_ALLOWED if XTZ was attached to the request.
  @sp.entry_point	
  def unregister(self, unit): 
    sp.set_type(unit, sp.TUnit)

    baker = sp.sender

    # Validate no XTZ is attached to the request
    sp.verify(sp.amount == sp.mutez(0), Errors.AMOUNT_NOT_ALLOWED)

    # Validate the sending baker is registered
    sp.verify(self.data.registry.contains(baker), Errors.BAD_PARAM)

    # Return the bonded XTZ
    sp.send(baker, self.data.registry[baker].bondAmount)

    # Remove the entry
    del self.data.registry[baker]

  ####################################################################################
  # Governance Entrypoints
  ####################################################################################

  # Set the administrator of this contract contract.
  # May only be called by the administrator contract.
  #
  # Fails with BAD_SENDER if the sender is not the administrator.
  # Fails with AMOUNT_NOT_ALLOWED if XTZ was attached to the request.
  @sp.entry_point	
  def setAdministrator(self, param):
    sp.set_type(param, sp.TRecord(newAdministratorAddress = sp.TAddress).layout("newAdministratorAddress"))
    
    # Validate the sender is the administrator
    sp.verify(sp.sender == self.data.administratorAddress, Errors.BAD_SENDER)

    # Validate no XTZ is attached to the request
    sp.verify(sp.amount == sp.mutez(0), Errors.AMOUNT_NOT_ALLOWED)

    # Update administrator
    self.data.administratorAddress = param.newAdministratorAddress

  # Set the bond amount for new registrations.
  # May only be called by the administrator contract.
  #
  # Fails with BAD_SENDER if the sender is not the administrator.
  # Fails with AMOUNT_NOT_ALLOWED if XTZ was attached to the request.
  @sp.entry_point	
  def setBondAmount(self, param):
    sp.set_type(param, sp.TRecord(newBondAmount = sp.TMutez).layout("newBondAmount"))
    
    # Validate the sender is the administrator
    sp.verify(sp.sender == self.data.administratorAddress, Errors.BAD_SENDER)

    # Validate no XTZ is attached to the request
    sp.verify(sp.amount == sp.mutez(0), Errors.AMOUNT_NOT_ALLOWED)

    # Update bondAmount
    self.data.bondAmount = param.newBondAmount

sp.add_compilation_target("registry", FlashBakeRegistry())

####################################################################################
# Tests
####################################################################################

# Register

@sp.add_test(name = "register - Can register a baker")
def test():
  scenario = sp.test_scenario()

  # GIVEN a bond amount
  bondAmount = sp.tez(10)

  # AND a new registry contract
  registry = FlashBakeRegistry(
    bondAmount = bondAmount
  )
  scenario += registry

  # WHEN a baker registers
  endpointUrl = "https://flashbaker.io/inject"
  param = sp.record(
    endpointUrl = endpointUrl
  )
  scenario += registry.register(param).run(
    amount = bondAmount,
    sender = Addresses.BAKER_ADDRESS
  )

  # THEN the contract registers the baker correctly
  scenario.verify(registry.data.registry[Addresses.BAKER_ADDRESS].endpointUrl == endpointUrl)
  scenario.verify(registry.data.registry[Addresses.BAKER_ADDRESS].bondAmount == bondAmount)

  # AND the registry received the XTZ
  scenario.verify(registry.balance == bondAmount)

@sp.add_test(name = "register - Fails with bad bond amount")
def test():
  scenario = sp.test_scenario()

  # GIVEN a bond amount
  bondAmount = sp.tez(10)

  # AND a new registry contract
  registry = FlashBakeRegistry(
    bondAmount = bondAmount
  )
  scenario += registry

  # WHEN a baker registers with a bond amount
  wrongBondAmount = bondAmount + sp.tez(1)
  endpointUrl = "https://flashbaker.io/inject"
  param = sp.record(
    endpointUrl = endpointUrl
  )

  # THEN the call fails with BAD_BOND_AMOUNT
  scenario += registry.register(param).run(
    amount = wrongBondAmount,
    sender = Addresses.BAKER_ADDRESS,
    valid = False,
    exception = Errors.BAD_BOND_AMOUNT
  )

@sp.add_test(name = "register - Fails if baker is registered")
def test():
  scenario = sp.test_scenario()

  # GIVEN a bond amount
  bondAmount = sp.tez(10)

  # AND a registry contract that has a baker registered
  registry = FlashBakeRegistry(
    bondAmount = bondAmount,
    registry = sp.big_map(
      l = {
        Addresses.BAKER_ADDRESS: sp.record(
          endpointUrl = "https://flashbaker.io/inject",
          bondAmount = bondAmount
        )
      }
    )
  )
  registry.set_initial_balance(bondAmount)
  scenario += registry

  # WHEN the already registered baker tries to register
  updatedEndpointUrl = "https://new.flashbaker.io/inject"
  param = sp.record(
    endpointUrl = updatedEndpointUrl
  )

  # THEN the call fails with BAD_PARAM
  scenario += registry.register(param).run(
    amount = bondAmount,
    sender = Addresses.BAKER_ADDRESS,
    valid = False,
    exception = Errors.BAD_PARAM
  )

# Unregister

@sp.add_test(name = "unregister - Can unregister a baker")
def test():
  scenario = sp.test_scenario()

  # GIVEN a bond amount
  bondAmount = sp.tez(10)

  # AND a registry contract that has a baker registered
  registry = FlashBakeRegistry(
    bondAmount = bondAmount,
    registry = sp.big_map(
      l = {
        Addresses.BAKER_ADDRESS: sp.record(
          endpointUrl = "https://flashbaker.io/inject",
          bondAmount = bondAmount
        )
      }
    )
  )
  registry.set_initial_balance(bondAmount)
  scenario += registry

  # WHEN the already registered baker unregisters
  scenario += registry.unregister(sp.unit).run(
    sender = Addresses.BAKER_ADDRESS,
  )

  # THEN the baker is unregistered
  scenario.verify(~registry.data.registry.contains(Addresses.BAKER_ADDRESS))

  # AND the bond was transferred to the baker
  scenario.verify(registry.balance == sp.tez(0))

@sp.add_test(name = "unregister - fails if baker is not registered")
def test():
  scenario = sp.test_scenario()

  # GIVEN a bond amount
  bondAmount = sp.tez(10)

  # AND a registry contract that is empty
  registry = FlashBakeRegistry(
    bondAmount = bondAmount,
    registry = sp.big_map(
      l = {}
    )
  )
  scenario += registry

  # WHEN an unregistered baker attempts to unregister
  # THEN the call fails with BAD_PARAM
  scenario += registry.unregister(sp.unit).run(
    sender = Addresses.BAKER_ADDRESS,
    valid = False,
    exception = Errors.BAD_PARAM
  )


@sp.add_test(name = "unregister - fails if an amount is attached")
def test():
  scenario = sp.test_scenario()

  # GIVEN a bond amount
  bondAmount = sp.tez(10)

  # AND a registry contract that has a baker registered
  registry = FlashBakeRegistry(
    bondAmount = bondAmount,
    registry = sp.big_map(
      l = {
        Addresses.BAKER_ADDRESS: sp.record(
          endpointUrl = "https://flashbaker.io/inject",
          bondAmount = bondAmount
        )
      }
    )
  )
  registry.set_initial_balance(bondAmount)
  scenario += registry

  # WHEN the registered baker attempts to unregister and attaches an amount
  # THEN the call fails with AMOUNT_NOT_ALLOWED
  scenario += registry.unregister(sp.unit).run(
    amount = sp.tez(1),
    sender = Addresses.BAKER_ADDRESS,
    valid = False,
    exception = Errors.AMOUNT_NOT_ALLOWED
  )

# setAdministrator

@sp.add_test(name = "setAdministrator - Can set a new administrator")
def test():
  scenario = sp.test_scenario()

  # GIVEN registry contract
  registry = FlashBakeRegistry()
  scenario += registry

  # WHEN the administrator rotates the administrator address
  param = sp.record(
    newAdministratorAddress = Addresses.ROTATED_ADDRESS
  )
  scenario += registry.setAdministrator(param).run(
    sender = Addresses.ADMINISTRATOR_ADDRESS
  )

  # THEN the administrator address is updated.
  scenario.verify(registry.data.administratorAddress == Addresses.ROTATED_ADDRESS)

@sp.add_test(name = "setAdministrator - Fails if not called by administrator")
def test():
  scenario = sp.test_scenario()

  # GIVEN registry contract
  registry = FlashBakeRegistry()
  scenario += registry

  # WHEN someone other than the administrator tries to rotate the administrator address
  # THEN the call fails with BAD_SENDER
  param = sp.record(
    newAdministratorAddress = Addresses.ROTATED_ADDRESS
  )
  scenario += registry.setAdministrator(param).run(
    sender = Addresses.NULL_ADDRESS,
    valid = False,
    exception = Errors.BAD_SENDER
  )

@sp.add_test(name = "setAdministrator - Fails if called with an amount")
def test():
  scenario = sp.test_scenario()

  # GIVEN registry contract
  registry = FlashBakeRegistry()
  scenario += registry

  # WHEN the administrator rotates the administrator address with an amount
  # THEN the call fails with AMOUNT_NOT_ALLOWED
  param = sp.record(
    newAdministratorAddress = Addresses.ROTATED_ADDRESS
  )
  scenario += registry.setAdministrator(param).run(
    amount = sp.tez(1),
    sender = Addresses.ADMINISTRATOR_ADDRESS,
    valid = False,
    exception = Errors.AMOUNT_NOT_ALLOWED
  )

# setBondAmount

@sp.add_test(name = "setBondAmount - Can set a new bond amount")
def test():
  scenario = sp.test_scenario()

  # GIVEN registry contract
  bondAmount = sp.tez(10)
  registry = FlashBakeRegistry(
    bondAmount = bondAmount
  )
  scenario += registry

  # WHEN the administrator sets a new bond amount
  newBondAmount = bondAmount + sp.tez(1)
  param = sp.record(
    newBondAmount = newBondAmount
  )
  scenario += registry.setBondAmount(param).run(
    sender = Addresses.ADMINISTRATOR_ADDRESS
  )

  # THEN the bond amount is updated
  scenario.verify(registry.data.bondAmount == newBondAmount)

@sp.add_test(name = "setBondAmount - Fails if not called by administrator")
def test():
  scenario = sp.test_scenario()

  # GIVEN registry contract
  bondAmount = sp.tez(10)
  registry = FlashBakeRegistry(
    bondAmount = bondAmount
  )
  scenario += registry

  # WHEN someone other than the administrator attempts to update the bond amount
  # THEN the call fails with BAD_SENDER
  newBondAmount = bondAmount + sp.tez(1)
  param = sp.record(
    newBondAmount = newBondAmount
  )
  scenario += registry.setBondAmount(param).run(
    sender = Addresses.NULL_ADDRESS,
    valid = False,
    exception = Errors.BAD_SENDER
  )

@sp.add_test(name = "setBondAmount - Fails if called with an amount")
def test():
  scenario = sp.test_scenario()

  # GIVEN registry contract
  bondAmount = sp.tez(10)
  registry = FlashBakeRegistry(
    bondAmount = bondAmount
  )
  scenario += registry

  # WHEN the administrator sets a new bond amount with an amount of XTZ attached
  # THEN the call fails with AMOUNT_NOT_ALLOWED
  newBondAmount = bondAmount + sp.tez(1)
  param = sp.record(
    newBondAmount = newBondAmount
  )
  scenario += registry.setBondAmount(param).run(
    amount = sp.tez(1),
    sender = Addresses.ADMINISTRATOR_ADDRESS,
    valid = False,
    exception = Errors.AMOUNT_NOT_ALLOWED
  )
