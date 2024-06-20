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
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Heading sx={{ paddingBottom: 'base.spacing.x4' }}>
          {headingText}
        </Heading>

        <Body
          size="small"
          sx={{
            textAlign: 'center',
            color: 'base.color.text.body.secondary',
          }}
        >
          {subheadingText}
        </Body>
      </Box>

      <Box>
        {primaryButtonText && onPrimaryButtonClick && (
          <Box
            sx={{
              paddingBottom: 'base.spacing.x2',
            }}
          >
            <Button
              sx={{
                width: '100%',
              }}
              variant="primary"
              size="large"
              testId="handover-primary-button"
              onClick={onPrimaryButtonClick}
            >
              {primaryButtonText}
            </Button>
          </Box>
        )}
        {secondaryButtonText && onSecondaryButtonClick && (
          <Box
            sx={{
              paddingBottom: 'base.spacing.x4',
            }}
          >
            <Button
              sx={{
                width: '100%',
              }}
              variant="tertiary"
              size="large"
              testId="handover-secondary-button"
              onClick={onSecondaryButtonClick}
            >
              {secondaryButtonText}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
