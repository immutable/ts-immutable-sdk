import { Box, Button } from "@biom3/react";
import { FooterNavigationStyles } from "./FooterStyles";

export interface FooterProps {
}

export const FooterNavigation = () => {
  return (
    <Box sx={FooterNavigationStyles}>
      <Button variant='secondary'>Let's go</Button>
    </Box>
  )
}
