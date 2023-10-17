import { Box, ButtCon } from '@biom3/react';
import { useState } from 'react';
import { isCopiedStyle } from './CopyButtonStyles';
import { UserJourney, useAnalytics } from '../../../../context/analytics-provider/SegmentAnalyticsProvider';

export function CopyButton({
  textToCopy,
}: {
  textToCopy?: string;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const { track } = useAnalytics();

  const handleCopy = () => {
    if (textToCopy != null) {
      track({
        userJourney: UserJourney.WALLET,
        screen: 'Settings',
        control: 'CopyWalletAddress',
        controlType: 'Button',
      });
      navigator.clipboard.writeText(textToCopy);
    }

    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return (
    <Box>
      {textToCopy && (
      <Box
        sx={{
          cursor: 'pointer',
        }}
      >
        <ButtCon
          sx={
            isCopied
              ? isCopiedStyle
              : {}
          }
          onClick={handleCopy}
          size="small"
          icon={isCopied ? 'Tick' : 'CopyText'}
        />
      </Box>
      )}
    </Box>
  );
}
