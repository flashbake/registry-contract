####################################################################################
# Default addresses for use in testing.
#
# These addresses are unique, and providing them names makes tests easier to read
# and reason about.
####################################################################################

import smartpy as sp

# An address which acts as a Administrator.
ADMINISTRATOR_ADDRESS = sp.address("tz1VmiY38m3y95HqQLjMwqnMS7sdMfGomzKi")

# An address that represents a baker that will regisster / unregister in the registry
BAKER_ADDRESS = sp.address("tz1abmz7jiCV2GH2u81LRrGgAFFgvQgiDiaf")

# An address will be rotated to
ROTATED_ADDRESS = sp.address("tz1W5VkdB5s7ENMESVBtwyt9kyvLqPcUczRT")

# An address which is never used. This is a `null` value for addresses.
NULL_ADDRESS = sp.address("tz1bTpviNnyx2PXsNmGpCQTMQsGoYordkUoA")