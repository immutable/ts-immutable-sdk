'use client';

export function register() {
  if (process.env.NEXT_PUBLIC_INSTRUMENTATION_ENABLED) {
    console.log('Registering instrumentation for coverage tracking');
  }
}

export const sideEffects = true; 