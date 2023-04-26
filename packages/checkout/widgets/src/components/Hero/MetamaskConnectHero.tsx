import { Box, Logo } from "@biom3/react"
import purpleDownGradient from '../../assets/PurpleDownGradient.svg';

export const MetamaskConnectHero = () => {
  return (
    <Box sx={{backgroundImage: `url(${purpleDownGradient})`, height: '100%', width: '100%'}}>
      <Box sx={{height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <Logo logo="MetaMaskSymbol" sx={{width: '206px'}} />
      </Box>
    </Box>
  )
}