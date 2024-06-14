import { Box, Button, Heading } from '@biom3/react';

export function HandoverError({
  headingText,
  buttonCtaText,
  onButtonCtaClick,
  secondaryButtonText,
  onSecondaryButtonClick,
}: {
  headingText: string | undefined;
  buttonCtaText?: string | undefined;
  onButtonCtaClick?: () => void;
  secondaryButtonText?: string | undefined;
  onSecondaryButtonClick?: () => void;
}) {
  return (
    <>
      <Heading sx={{ paddingBottom: 'base.spacing.x6' }}>{headingText}</Heading>
      {buttonCtaText && onButtonCtaClick && (
        <Box
          sx={{
            paddingX: 'base.spacing.x4',
            paddingBottom: 'base.spacing.x2',
          }}
        >
          <Button
            sx={{ width: '100%' }}
            variant="primary"
            size="large"
            onClick={onButtonCtaClick}
          >
            {buttonCtaText}
          </Button>
        </Box>
      )}

      {secondaryButtonText && onSecondaryButtonClick && (
        <Box
          sx={{
            paddingX: 'base.spacing.x4',
            paddingBottom: 'base.spacing.x4',
          }}
        >
          <Button
            sx={{ width: '100%' }}
            variant="tertiary"
            size="large"
            onClick={onSecondaryButtonClick}
          >
            {secondaryButtonText}
          </Button>
        </Box>
      )}
    </>
  );
}
