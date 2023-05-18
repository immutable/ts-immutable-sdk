import { Box, Button } from '@biom3/react';
import { footerButtonStyles } from './FooterStyles';

export interface FooterButtonProps {
  hideActionButton?: boolean;
  actionText: string;
  onActionClick: () => void;
}

export function FooterButton({
  actionText,
  onActionClick,
  hideActionButton = false,
}: FooterButtonProps) {
  const showButton = !hideActionButton;
  return (
    <Box testId="footer-button-container" sx={footerButtonStyles}>
      {showButton && (
        <Button
          testId="footer-button"
          size="large"
          variant="secondary"
          onClick={onActionClick}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
}
