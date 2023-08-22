import React, { useEffect } from "react";
import { usePassportProvider } from "../context/PassportProvider";

function Container({children}: {children: JSX.Element | JSX.Element[]}) {
  const { connectSilent } = usePassportProvider();

  useEffect(() => {
    connectSilent();
  }, []);

  return (
    <div>
      {children}
    </div>
  );
}

export default Container;
