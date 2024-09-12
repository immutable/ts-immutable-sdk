import { Divider, Heading } from '@biom3/react';

export const Legend = ({ children }: { children: React.ReactNode }) => (
  <Divider
    sx={{
      marginTop: 'base.spacing.x6',
      marginBottom: 'base.spacing.x2',
    }}
    children={(<Heading size="small">{children}</Heading>) as any}
  />
);
