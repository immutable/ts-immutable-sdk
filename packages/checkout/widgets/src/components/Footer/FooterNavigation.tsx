import { Box, Button } from "@biom3/react";

export interface FooterProps {
}

export const FooterNavigation = () => {
  return (
    <Box sx={{
      width: '100%',
      display: 'flex',
      flexDirection: 'row', 
      justifyContent: 'flex-end', 
      alignItems: 'center',
      }}>
      <Button variant='secondary'>Let's go</Button>
    </Box>
  )
}
