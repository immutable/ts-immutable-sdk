import { Box, Button } from "@biom3/react";
import { FooterNavigationStyles } from "./FooterStyles";

export interface FooterProps {
  text?: string
  callToAction?: () => void
}

export const FooterNavigation = (props: FooterProps) => {
  const { callToAction, text } = props;

  return (
    <Box sx={FooterNavigationStyles}>
      <Button variant='secondary' onClick={() => callToAction && callToAction()}>{text}</Button>
    </Box>
  )
}
