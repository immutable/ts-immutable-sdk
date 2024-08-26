import { Box, Button } from '@biom3/react';
import { useTranslation } from 'react-i18next';
import {
  swapButtonBoxStyle,
  swapButtonIconLoadingStyle,
} from './SwapButtonStyles';

export interface SwapButtonProps {
  loading: boolean
  validator: () => boolean
  sendTransaction: () => Promise<void>;
}

export function SwapButton({
  loading,
  validator,
  sendTransaction,
}: SwapButtonProps) {
  const { t } = useTranslation();

  const handleClick = async () => {
    const canSwap = validator();
    if (canSwap) {
      await sendTransaction();
    }
  };

  return (
    <Box sx={swapButtonBoxStyle}>
      <Button
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
