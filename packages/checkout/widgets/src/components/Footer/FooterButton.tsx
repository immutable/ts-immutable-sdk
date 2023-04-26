import { Box, Button } from "@biom3/react";
import { FooterButtonStyles } from "./FooterStyles";

export interface FooterButtonProps {
  hideActionButton?: boolean;
  actionText: string;
  onActionClick: (...args: any[]) => void;
}

export const FooterButton = ({actionText, onActionClick, hideActionButton = false}: FooterButtonProps) => {
  const showButton = !hideActionButton;
  return (
    <Box testId="footer-button-container" sx={FooterButtonStyles}>
      {showButton && <Button testId="footer-button" size="large" variant='secondary' onClick={onActionClick}>{actionText}</Button>}
    </Box>
  )
}
