import { Box, Button } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import {
  swapButtonBoxStyle,
  swapButtonIconLoadingStyle,
} from './SwapButtonStyles';

export interface SwapButtonProps {
  visibility: boolean;
  loading: boolean
  validator: () => boolean
  sendTransaction: () => Promise<void>; // Added this line
}

export function SwapButton({
  visibility,
  loading,
  validator,
  sendTransaction, // Added this line
}: SwapButtonProps) {
  const { t } = useTranslation();

  const handleClick = async () => {
    const canSwap = validator();
    if (canSwap) {
      await sendTransaction(); // Call sendTransaction here
    }
  };

  return (
    <Box sx={swapButtonBoxStyle}>
      <Button
        sx={{ visibility: visibility ? 'visible' : 'hidden' }}
        testId="swap-button"
        disabled={loading}
        variant="primary"
        onClick={handleClick}
        size="large"
      >
        {loading ? (
          <Button.Icon icon="Loading" sx={swapButtonIconLoadingStyle} />
        ) : t('views.SWAP.swapForm.buttonText')}
      </Button>
    </Box>
  );
}
