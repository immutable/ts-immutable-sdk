'use client';

import { passportInstance } from '../passport';
import PassportRedirect from '@/components/PassportRedirect';

export default function Page() {
  return <PassportRedirect passportInstance={passportInstance} />
}
