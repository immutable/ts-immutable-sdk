import { Box, Body } from '@biom3/react';

type ErrorMessageProps = {
  children: React.ReactNode;
};

const ErrorMessage = ({ children }: ErrorMessageProps) => {
  return (
    <Box
      sx={{
        background: 'base.color.status.fatal.bright',
        padding: 'base.spacing.x4',
        borderRadius: 'base.borderRadius.x4',
        marginTop: 'base.spacing.x4',
      }}
    >
      <Body size="small">{children}</Body>
    </Box>
  );
};

export default ErrorMessage;
