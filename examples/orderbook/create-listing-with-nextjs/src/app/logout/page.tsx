'use client';

import {Box, Heading, Link} from "@biom3/react";
import NextLink from 'next/link';

export default function Logout() {
  // render the view for after the logout is complete
  return (
      <Box>
          <Heading size="medium" sx={{marginBottom: 'base.spacing.x5'}}>Logged out</Heading>
          <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </Box>
  );
}
