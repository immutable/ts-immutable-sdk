import { Box } from "@biom3/react";

export interface FooterProps {
  children: React.ReactNode;
}

export const Footer = ({ children }) => {
  return (
    <Box>
        {children}
    </Box>
  )
}
