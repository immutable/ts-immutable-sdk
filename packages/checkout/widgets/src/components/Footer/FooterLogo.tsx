import { Body, Box } from "@biom3/react"
import { FooterLogoStyles } from "./FooterStyles"
import poweredByImmutable from './PoweredByImmutableLogo.svg'

export const FooterLogo = () => {
  return(
    <Box sx={FooterLogoStyles}>
      <Body size="medium"><img alt="Powered by Immutable" src={poweredByImmutable} /></Body>
    </Box>
  )
}