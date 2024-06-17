import { Button, Heading } from '@biom3/react';

export function HandoverContent({
  headingText,
  primaryButtonText,
  onPrimaryButtonClick,
  secondaryButtonText,
  onSecondaryButtonClick,
}: {
  headingText: string;
  primaryButtonText?: string;
  onPrimaryButtonClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryButtonClick?: () => void;
}) {
  return (
    <>
      <Heading sx={{ paddingBottom: 'base.spacing.x42' }}>
        {headingText}
      </Heading>
      {primaryButtonText && onPrimaryButtonClick && (
        <Button
          sx={{ width: '100%' }}
          variant="primary"
          size="large"
          onClick={onPrimaryButtonClick}
        >
          {primaryButtonText}
        </Button>
      )}

      {secondaryButtonText && onSecondaryButtonClick && (
        <Button
          sx={{ width: '100%' }}
          variant="tertiary"
          size="large"
          onClick={onSecondaryButtonClick}
        >
          {secondaryButtonText}
        </Button>
      )}
    </>
  );
}
