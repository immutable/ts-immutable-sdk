import { Box, Body } from '@biom3/react';

type SuccessMessageProps = {
  children: React.ReactNode;
};

const SuccessMessage = ({ children }: SuccessMessageProps) => {
  return (
    <Box
      sx={{
        background: 'base.color.status.success.bright',
        padding: 'base.spacing.x4',
        borderRadius: 'base.borderRadius.x4',
        marginTop: 'base.spacing.x4',
      }}
    >
      <Body size="small">{children}</Body>
    </Box>
  );
};

export default SuccessMessage;
