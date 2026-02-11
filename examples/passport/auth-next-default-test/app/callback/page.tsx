"use client";

import { CallbackPage } from "@imtbl/auth-next-client";

export default function Callback() {
  return (
    <div>
      <h1>Processing authentication...</h1>
      <CallbackPage redirectTo="/" />
    </div>
  );
}
