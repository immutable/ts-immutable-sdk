import { useEffect } from "react";
import { passport } from "../../../utils/passport";


export function AddTokensPassportLogin() {
  useEffect(() => {
    passport.loginCallback();
  }, []);

  return null;
}
