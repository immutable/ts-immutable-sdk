import { Passport } from "@imtbl/passport";
import { useContext, useEffect, useMemo } from "react";
import { WidgetContext } from "./WidgetProvider";
import { passportModuleConfig } from "./Marketplace";

export function LoginCallback() {

  const passport = useMemo(() => new Passport(passportModuleConfig), []);

  useEffect(() => {
    console.log('login callback', passport)
      passport?.loginCallback();
  }, [passport])
  return(<></>);
}