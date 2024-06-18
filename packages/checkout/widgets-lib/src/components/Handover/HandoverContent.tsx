import {
  Body, Box, Button, Heading,
} from '@biom3/react';

export function HandoverContent({
  headingText,
  subheadingText,
  primaryButtonText,
  onPrimaryButtonClick,
  secondaryButtonText,
  onSecondaryButtonClick,
}: {
  headingText: string;
  subheadingText?: string;
  primaryButtonText?: string;
  onPrimaryButtonClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryButtonClick?: () => void;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Heading>{headingText}</Heading>

        <Body
          size="small"
          sx={{
            textAlign: 'center',
            color: 'base.color.text.body.secondary',
            paddingTop: 'base.spacing.x4',
          }}
        >
          {subheadingText}
        </Body>
      </Box>

      <Box sx={{ paddingTop: 'base.spacing.x10' }}>
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
            sx={{ width: '100%', paddingTop: 'base.spacing.x3' }}
            variant="tertiary"
            size="large"
            onClick={onSecondaryButtonClick}
          >
            {secondaryButtonText}
          </Button>
        )}
      </Box>
    </Box>
  );
}
