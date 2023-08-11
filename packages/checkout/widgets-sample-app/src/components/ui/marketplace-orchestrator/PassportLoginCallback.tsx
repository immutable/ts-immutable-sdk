import { Passport } from "@imtbl/passport";
import { useEffect, useMemo } from "react";
import { passportConfig } from "./passportConfig";

export function PassportLoginCallback() {

  const passport = useMemo(() => new Passport(passportConfig), []);

  useEffect(() => {
      passport?.loginCallback();
  }, [passport])
  return(<></>);
}