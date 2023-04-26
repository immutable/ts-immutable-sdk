import { Box, Logo } from "@biom3/react"
import purpleDownGradient from '../../assets/PurpleDownGradient.svg';

export const MetamaskConnectHero = () => {
  return (
    <Box testId="metamask-connect-hero" sx={{backgroundImage: `url(${purpleDownGradient})`, height: '100%', width: '100%'}}>
      <Box sx={{height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <Logo testId="metamask-connect-hero-logo" logo="MetaMaskSymbol" sx={{width: '206px'}} />
      </Box>
    </Box>
  )
}