import { useEffect } from "react";
import { passport } from "../../../utils/passport";


export function AddTokensPassportLogout() {
  useEffect(() => {
    passport.logoutSilentCallback('http://localhost:3000/add-tokens');
  }, []);

  return null;
}
