import { useEffect } from "react";
import { passport } from "./passport";


export function PurchasePassportLogin() {
  useEffect(() => {
    passport.loginCallback();
  }, []);

  return null;
}
