"use client";

import { useEffect } from "react";
import { usePassport } from "@/context/passport";

export default function Page() {
  const { passportSilentInstance } = usePassport();

  useEffect(() => {
    if (passportSilentInstance) {
      const passport = passportSilentInstance;
      // #doc passport-silent-logout-callback
      passport.logoutSilentCallback("http://localhost:3000");
      // #enddoc passport-silent-logout-callback
    }
  }, [passportSilentInstance]);
  return <p />;
}
