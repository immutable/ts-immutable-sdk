import { Box, Button } from "@biom3/react";
import { FooterNavigationStyles } from "./FooterStyles";

export interface FooterProps {
  actionText: string;
}

export const FooterNavigation = (props:FooterProps) => {
  const actionButtonText = props.actionText || 'Let\'s go'
  return (
    <Box sx={FooterNavigationStyles}>
      <Button variant='secondary'>{actionButtonText}</Button>
    </Box>
  )
}
