import { Box } from "@biom3/react"
import { FooterLogoStyles } from "./FooterStyles"
import poweredByImmutable from './PoweredByImmutableLogo.svg'

export const FooterLogo = () => {
  return(
    <Box testId="footer-logo-container" sx={FooterLogoStyles}>
      <img data-testid="footer-logo-image" alt="Powered by Immutable" src={poweredByImmutable} style={{color:'white'}} />
    </Box>
  )
}