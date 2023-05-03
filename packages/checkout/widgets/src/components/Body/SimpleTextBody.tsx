import { Box, Heading, Body } from '@biom3/react';
import {
  BodyBoxStyle,
  BodyStyle,
  SimpleTextBodyStyle,
} from './SimpleTextBodyStyles';

export interface SimpleTextBodyProps {
  heading: string;
  children?: React.ReactNode;
}

export const SimpleTextBody = (props: SimpleTextBodyProps) => {
  const { heading, children } = props;

  return (
    <Box sx={SimpleTextBodyStyle}>
      <Heading size="small">{heading}</Heading>
      <Box sx={BodyBoxStyle}>
        <Body size="small" sx={BodyStyle}>
          {children}
        </Body>
      </Box>
    </Box>
  );
};
