import { Box, ButtCon } from '@biom3/react';
import { useState } from 'react';
import { isCopiedStyle } from './CopyButtonStyles';

export const CopyButton = ({
  textToCopy,
}: {
  textToCopy?: string;
}) => {
  const [isCopied, setIsCopied] = useState(false);

  function handleCopy() {
    textToCopy != null && navigator.clipboard.writeText(textToCopy);

    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  }

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
};