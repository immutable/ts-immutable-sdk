import { Box } from "@biom3/react"
import { FooterLogoStyles } from "./FooterStyles"
import poweredByImmutable from './PoweredByImmutableLogo.svg'
export interface FooterLogoProps {
  hideLogo?: boolean;
}
export const FooterLogo = ({hideLogo}: FooterLogoProps) => {
  const showLogo = !hideLogo;
  return(
    <Box testId="footer-logo-container" sx={FooterLogoStyles}>
      {showLogo && <img data-testid="footer-logo-image" alt="Powered by Immutable" src={poweredByImmutable} style={{color:'white'}} />}
    </Box>
  )
}