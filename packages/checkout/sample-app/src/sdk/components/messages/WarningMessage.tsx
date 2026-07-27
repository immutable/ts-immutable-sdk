import { Box, Body } from '@biom3/react';

type WarningMessageProps = {
  children: React.ReactNode;
};

const WarningMessage = ({ children }: WarningMessageProps) => {
  return (
    <Box
      sx={{
        background: 'base.color.status.attention.bright',
        padding: 'base.spacing.x4',
        borderRadius: 'base.borderRadius.x4',
        marginTop: 'base.spacing.x4',
      }}
    >
      <Body size="small">{children}</Body>
    </Box>
  );
};

export default WarningMessage;
