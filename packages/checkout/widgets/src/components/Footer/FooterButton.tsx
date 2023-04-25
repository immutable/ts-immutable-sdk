import { Box, Button } from "@biom3/react";
import { FooterButtonStyles } from "./FooterStyles";

export interface FooterButtonProps {
  actionText: string;
  onActionClick: () => void;
}

export const FooterButton = ({actionText, onActionClick}: FooterButtonProps) => {
  return (
    <Box testId="footer-button-container" sx={FooterButtonStyles}>
      <Button testId="footer-button" size="large" variant='secondary' onClick={onActionClick}>{actionText}</Button>
    </Box>
  )
}
