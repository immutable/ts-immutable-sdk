import { Box } from "@biom3/react";

export interface HeaderProps {
  children: React.ReactNode;
}

export const Header = ({ children }) => {
  return (
    <Box>
        {children}
    </Box>
  )
}
