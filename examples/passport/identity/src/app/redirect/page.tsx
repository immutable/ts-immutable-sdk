'use client';

import { usePassport } from "@/context/passport";
import { useEffect } from "react";

export default function Redirect() {
  const { passportInstance } = usePassport();

  useEffect(() => {
    if(passportInstance) {
      // #doc passport-login-callback
      passportInstance.loginCallback();
      // #enddoc passport-login-callback
    }
  }, [passportInstance]);

  return (<h1>Redirecting...</h1>);
}
