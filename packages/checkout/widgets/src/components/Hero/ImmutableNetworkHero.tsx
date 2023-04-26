import { Box } from "@biom3/react"
import purpleDownGradient from '../../assets/PurpleDownGradient.svg';
import immutableNetwork from '../../assets/ImmutableNetwork.svg';

export const ImmutableNetworkHero = () => {
  return (
    <Box sx={{backgroundImage: `url(${purpleDownGradient})`, height: '100%', width: '100%'}}>
      <Box sx={{height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <img alt="Immutable Network" src={immutableNetwork} />
      </Box>
    </Box>
  )
}