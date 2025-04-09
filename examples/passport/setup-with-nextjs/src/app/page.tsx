'use client'

import React from 'react';
// import Link from 'next/link'; // Remove unused import
import NextLink from 'next/link'; // Use NextLink alias for clarity with Biom3 Button rc prop
import { Heading, Button } from '@biom3/react'; // Import Biom3 components

// Define descriptions here, mapping keys to new static routes
const instanceRoutes: { [key: string]: { description: string, path: string } } = {
  default:              { description: 'Default configuration',                    path: '/passport-setup-default' },
  disabledOverlays:     { description: 'Popup overlays disabled',                path: '/passport-setup-disabled-overlays' },
  minimalScopes:        { description: 'Minimal scopes (openid, offline_access)', path: '/passport-setup-minimal-scopes' },
  allScopes:            { description: 'All scopes (email, transact, etc)',      path: '/passport-setup-all-scopes' },
  silentLogout:         { description: 'Silent logout mode',                     path: '/passport-setup-silent-logout' },
  genericOverlayDisabled: { description: 'Generic popup overlay disabled',         path: '/passport-setup-generic-overlay-disabled' },
  blockedOverlayDisabled: { description: 'Blocked popup overlay disabled',         path: '/passport-setup-blocked-overlay-disabled' },
};

export default function Home() {
  return (
    // Remove the <main> tag and inline styles, rely on AppWrapper's Stack for centering and layout
    <>
      <Heading size="medium" className="mb-1">
        Passport SDK - Passport Setup Examples
      </Heading>
      <p className="mb-1"> {/* Keep as <p>, add margin like buttons */}
        This example demonstrates various configurations for initializing the Immutable Passport SDK.
        Each link below leads to a page dedicated to a specific setup.
      </p>
      <Heading size="small" className="mb-1"> {/* Use smaller heading, add margin */}
        Explore Passport Setups:
      </Heading>
      {/* Remove <ul> and map directly to Buttons */}
      {Object.values(instanceRoutes).map(({ path, description }) => (
        <Button
          key={path}
          className="mb-1" // Add margin bottom
          size="medium"     // Use consistent button size
          rc={<NextLink href={path} />} // Use NextLink within Button's rc prop
        >
          {description}
        </Button>
      ))}
    </>
    // Remove closing </main>
  );
} 