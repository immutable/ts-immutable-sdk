'use client';

import PassportRedirect from '@/components/PassportRedirect';
import { passportInstance } from '../passport';

export default function Page() {
  return <PassportRedirect passportInstance={passportInstance} />;
}
