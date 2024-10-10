import { useEffect } from "react";
import { passport } from "./passport";


export function AddFundsPassportLogout() {
  useEffect(() => {
    passport.logoutSilentCallback('http://localhost:3000/add-funds');
  }, []);

  return null;
}
