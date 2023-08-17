import React from "react";
import { usePassportProvider } from "../context/PassportProvider";

function Login() {
  const { handleRedirectCallback } = usePassportProvider();

  React.useEffect(() => {
    handleRedirectCallback();
  }, []);

  return (
    <div>You are logged in!</div>
  );
}

export default Login;
