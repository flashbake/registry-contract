import { substituteVariables } from "@hover-labs/tezos-utils";
import BigNumber from 'bignumber.js'

const generateRegistryStorage = (multisigAddress: string, bondAmountMutez: BigNumber) => {
  let contractStorage = `
  (Pair 
    (Pair 
      (address %administratorAddress) 
      (mutez %bondAmount)
    ) 
    (Pair 
      (big_map %metadata string bytes) 
      (big_map %registry address (pair (string %endpointUrl) (mutez %bondAmount)))
    )
  )
  `

  // Taken from smartpy compiler output
  const metadata = `{Elt "" 0x74657a6f732d73746f726167653a64617461; Elt "data" 0x7b226e616d65223a2022466c61736862616b65205265676973747279222c20226465736372697074696f6e223a2022526567697374727920666f722042616b6572732077686f2077616e7420746f20706172746963697061746520696e20466c61736862616b65222c2022617574686f7273223a205b22544f444f225d2c2022686f6d6570616765223a2022544f444f227d}`

  contractStorage = substituteVariables(contractStorage, {
    "(address %administratorAddress)": multisigAddress,
    "(mutez %bondAmount)": bondAmountMutez,
    "(big_map %metadata string bytes)": metadata,
    "(big_map %registry address (pair (string %endpointUrl) (mutez %bondAmount)))": {},
  })

  if (contractStorage.includes("%")) {
    throw new Error("It appears we didn't substitute all variables in the contractStorage! Please check that you're substituting the entire set of variables for the initial storage.")
  }

  return contractStorage
}

export default generateRegistryStorage