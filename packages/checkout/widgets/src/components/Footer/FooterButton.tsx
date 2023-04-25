import { Box, Button } from "@biom3/react";
import { FooterButtonStyles } from "./FooterStyles";

export interface FooterButtonProps {
  actionText: string;
  onActionClick: () => void;
}

export const FooterButton = ({actionText, onActionClick}: FooterButtonProps) => {
  return (
    <Box sx={FooterButtonStyles}>
      <Button size="large" variant='secondary' onClick={onActionClick}>{actionText}</Button>
    </Box>
  )
}
