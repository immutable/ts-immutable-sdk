import { Box, Heading, Body } from '@biom3/react';
import {
  bodyBoxStyle,
  bodyStyle,
  simpleTextBodyStyle,
} from './SimpleTextBodyStyles';

export interface SimpleTextBodyProps {
  heading: string;
  children?: React.ReactNode;
}

export function SimpleTextBody(props: SimpleTextBodyProps) {
  const { heading, children } = props;

  return (
    <Box sx={simpleTextBodyStyle}>
      <Heading size="small">{heading}</Heading>
      <Box sx={bodyBoxStyle}>
        <Body size="small" sx={bodyStyle}>
          {children}
        </Body>
      </Box>
    </Box>
  );
}
