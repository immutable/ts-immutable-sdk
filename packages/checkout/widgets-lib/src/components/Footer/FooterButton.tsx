import { Box, Button } from '@biom3/react';
import { footerButtonIconLoadingStyle, footerButtonStyles } from './FooterStyles';

export interface FooterButtonProps {
  loading?: boolean;
  hideActionButton?: boolean;
  actionText: string;
  onActionClick: () => void;
}

export function FooterButton({
  actionText,
  onActionClick,
  hideActionButton = false,
  loading = false,
}: FooterButtonProps) {
  const showButton = !hideActionButton;
  return (
    <Box testId="footer-button-container" sx={footerButtonStyles}>
      {showButton && (
      <Button
        testId="footer-button"
        size="large"
        sx={{ width: '100%' }}
        variant="secondary"
        disabled={loading}
        onClick={onActionClick}
      >
        {loading ? (
          <Button.Icon icon="Loading" sx={footerButtonIconLoadingStyle} />
        ) : actionText}
      </Button>
      )}
    </Box>
  );
}
