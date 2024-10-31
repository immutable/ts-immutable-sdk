import { useEffect } from "react";
import { passport } from "./passport";


export function AddTokensPassportLogout() {
  useEffect(() => {
    passport.logoutSilentCallback('http://localhost:3000/add-tokens');
  }, []);

  return null;
}
