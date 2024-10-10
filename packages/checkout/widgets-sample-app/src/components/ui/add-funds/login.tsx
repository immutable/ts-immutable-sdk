import { useEffect } from "react";
import { passport } from "./passport";


export function AddFundsPassportLogin() {
  useEffect(() => {
    passport.loginCallback();
  }, []);

  return null;
}
