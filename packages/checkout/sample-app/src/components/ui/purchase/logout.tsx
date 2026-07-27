import { useEffect } from "react";
import { passport } from "./passport";


export function PurchasePassportLogout() {
  useEffect(() => {
    passport.logoutSilentCallback('http://localhost:3000/add-tokens');
  }, []);

  return null;
}
