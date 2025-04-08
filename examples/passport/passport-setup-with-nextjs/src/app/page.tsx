'use client';

import React, { Suspense } from 'react';
import { Button } from '@biom3/react';
import Link from 'next/link';

function HomeContent() {
  return (
    <div className="container">
      <h1>Immutable Passport Setup Options</h1>
      <p className="card">
        This example demonstrates different Passport setup configurations and how they affect the behavior of your application.
        You can explore various setup options such as popup overlay settings, scope configurations, and logout modes.
      </p>

      <div className="setup-options">
        <div className="setup-card">
          <h3>Standard Configuration</h3>
          <p>Default Passport setup with standard settings</p>
          <Link href="/passport-setup?config=standard">
            <Button variant="primary">Try Standard Setup</Button>
          </Link>
        </div>

        <div className="setup-card">
          <h3>Disabled Popup Overlays</h3>
          <p>Passport configured with popup overlays disabled</p>
          <Link href="/passport-setup?config=no-overlays">
            <Button variant="primary">Try No Overlays</Button>
          </Link>
        </div>

        <div className="setup-card">
          <h3>Minimal Scopes</h3>
          <p>Passport configured with only required scopes</p>
          <Link href="/passport-setup?config=minimal-scopes">
            <Button variant="primary">Try Minimal Scopes</Button>
          </Link>
        </div>

        <div className="setup-card">
          <h3>All Scopes</h3>
          <p>Passport configured with all available scopes</p>
          <Link href="/passport-setup?config=all-scopes">
            <Button variant="primary">Try All Scopes</Button>
          </Link>
        </div>

        <div className="setup-card">
          <h3>Silent Logout</h3>
          <p>Passport configured with silent logout mode</p>
          <Link href="/passport-setup?config=silent-logout">
            <Button variant="primary">Try Silent Logout</Button>
          </Link>
        </div>

        <div className="setup-card">
          <h3>Production Environment</h3>
          <p>Passport configured for production environment</p>
          <Link href="/passport-setup?config=production">
            <Button variant="primary">Try Production</Button>
          </Link>
        </div>

        <div className="setup-card">
          <h3>Advanced Options</h3>
          <p>Passport configured with advanced options including custom overrides</p>
          <Link href="/passport-setup?config=advanced-options">
            <Button variant="primary">Try Advanced Options</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
} 