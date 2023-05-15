import { Box, ButtCon } from '@biom3/react';
import { useState } from 'react';

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
    <Box sx={{ my: 'base.spacing.x4' }}>
          {textToCopy && (
            <Box
              sx={{
                cursor: 'pointer',
              }}
            >
              <ButtCon
                sx={
                  isCopied
                    ? {
                        background: 'base.color.status.success.bright',
                        fill: 'base.color.status.success.bright',
                      }
                    : {
                      background: 'none', color: 'white', border:'none'
                    }
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