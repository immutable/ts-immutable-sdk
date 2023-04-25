import { Box, Button } from "@biom3/react";
import { FooterNavigationStyles } from "./FooterStyles";

export interface FooterProps {
  actionText: string;
  onActionClick: () => void;
}

export const FooterNavigation = ({actionText, onActionClick}:FooterProps) => {
  const actionButtonText = actionText || 'Let\'s go'
  return (
    <Box sx={FooterNavigationStyles}>
      <Button size="large" variant='secondary' onClick={onActionClick}>{actionButtonText}</Button>
    </Box>
  )
}
