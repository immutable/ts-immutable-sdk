'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { push } = useRouter();

  useEffect(() => {
     push('/');
  }, [push]);
  return <p />;
};
