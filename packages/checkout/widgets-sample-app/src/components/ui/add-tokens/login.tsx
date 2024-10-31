import { useEffect } from "react";
import { passport } from "./passport";


export function AddTokensPassportLogin() {
  useEffect(() => {
    passport.loginCallback();
  }, []);

  return null;
}
