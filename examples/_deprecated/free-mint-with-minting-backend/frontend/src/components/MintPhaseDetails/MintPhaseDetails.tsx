import { Heading, VStack } from "@chakra-ui/react";
import { MintPhase } from "../../types/mintConfiguration";
import Countdown from "../Countdown/Countdown";

interface MintPhaseDetails {
  mintPhases: MintPhase[];
}

export const MintPhaseDetails = ({ mintPhases }: MintPhaseDetails) => {
  const dateNowMs = new Date().getTime();
  const isPreMint = mintPhases[0].startTime * 1000 > dateNowMs;
  const currentMintPhase = mintPhases.findIndex((phase) => {
    return phase.startTime * 1000 < dateNowMs && dateNowMs <= phase.endTime * 1000
  })
  const hasNextPhase = currentMintPhase !== -1 && currentMintPhase < mintPhases.length -1;

  return (
    <VStack>
      {isPreMint && <Countdown endTime={mintPhases[0].startTime} deadlineEventTopic="countdownMintPhase" />}
      {!isPreMint && (
      <>
        <Heading size={"md"}>Current phase: {mintPhases[currentMintPhase]?.name}</Heading>
        {hasNextPhase && (<><Heading size={"md"}>{`${mintPhases[currentMintPhase +1]?.name || "Next"} phase starts in: `}</Heading><Countdown endTime={mintPhases[currentMintPhase].endTime} deadlineEventTopic="countdownMintPhase" /></>)}
        </>
      )}
    </VStack>
  )
}