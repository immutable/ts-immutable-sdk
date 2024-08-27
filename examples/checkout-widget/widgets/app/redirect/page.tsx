'use client';

import { useEffect } from 'react';
import { usePassport } from "@/src/context/passport";

export default function Redirect() {
  const { passportInstance } = usePassport();
  useEffect(() => {
    if (passportInstance) {
      passportInstance?.loginCallback();
    }
  }, [passportInstance]);

  return(<></>);
}
