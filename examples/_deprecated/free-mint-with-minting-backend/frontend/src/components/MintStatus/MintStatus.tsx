import { useEffect, useRef, useState } from 'react'
import { MintRequestByIDResult } from '../../types/mintRequestById'
import { Heading, Link, Text, VStack } from '@chakra-ui/react'
import config, { applicationEnvironment } from '../../config/config'
import { shortenAddress } from '../../utils/walletAddress'
import { mintRequestById } from '../../api/mintRequestById'
import Countdown from '../Countdown/Countdown'
import { updateMintResultLS } from '../../utils/localStorage'
import { Mint } from '../../types/mint'

interface MintStatus {
  mintId: string;
  walletAddress: string;
}
export const MintStatus = ({ mintId, walletAddress }: MintStatus) => {
  const [mintSucceeded, setMintSucceeded] = useState(false);
  const [mintStatusFailed, setMintStatusFailed] = useState(false);
  
  const mintStatusRequestCount = useRef(0);

  useEffect(() => {
    const checkMintStatus = async (uuid: string) => {
      const result: MintRequestByIDResult = await mintRequestById(uuid);
      
      if(mintStatusRequestCount.current === 4) {
        // if we get to here, stop trying.
        setMintStatusFailed(true);
        return;
      }

      if(result.result[0].status === "pending") {
        mintStatusRequestCount.current++;
        setTimeout(async () => await checkMintStatus(mintId), 4000 * mintStatusRequestCount.current);
        return;
      }

      if(result.result[0].status === "succeeded"){
        updateMintResultLS({uuid: mintId} as Mint, 'succeeded')
        setMintSucceeded(true);
      }
    }

    if(mintId) {
      // start polling from mint uuid
      setTimeout(async() => await checkMintStatus(mintId), 10000);
    }
  }, [mintId])

  return (
    <div>
      {!mintSucceeded && (
        <VStack gap={2} alignItems={'center'}>
          <Text>Mint request receieved. Please be patient. Checking your mint status in: </Text>
          <Countdown size='md' endTime={(Date.now() + 10000)/1000} deadlineEventTopic='countdownMintStatus' />
        </VStack>
      )}
      {!mintStatusFailed && mintSucceeded && (
        <VStack>
          <Heading fontSize={"x-large"} color={'blue.400'}>Mint Succeeded!</Heading>
          <Link onClick={() => window.open(`${config[applicationEnvironment].explorerUrl}/address/${walletAddress}?tab=token_transfers`, "_blank")}>Inpect token transactions {shortenAddress(walletAddress)}</Link>
        </VStack>
        )}
      {mintStatusFailed && <Text>There was a problem checking the status of your mint. Please be patient</Text>}
    </div>
  )
}