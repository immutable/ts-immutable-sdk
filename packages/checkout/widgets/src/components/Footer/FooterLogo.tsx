import { Body, Box } from "@biom3/react"
import { FooterLogoStyles } from "./FooterStyles"

export const FooterLogo = () => {
  return(
    <Box sx={FooterLogoStyles}>
      <Body size="medium">Footer goes here</Body>
    </Box>
  )
}