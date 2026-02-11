import { LoginButton } from "./components/LoginButton";
import { LogoutButton } from "./components/LogoutButton";
import { LoginWithOverride } from "./components/LoginWithOverride";
import { LogoutWithOverride } from "./components/LogoutWithOverride";
import { ConfigInfo } from "./components/ConfigInfo";

export default function Home() {
  return (
    <main>
      <h1>🧪 Default Auth Test App</h1>
      <p>
        Testing <strong>@imtbl/auth-next-client</strong> and <strong>@imtbl/auth-next-server</strong> 
        with zero-config default auth.
      </p>

      <ConfigInfo />

      <hr style={{ margin: '2rem 0' }} />

      <h2>📋 Test 1: Zero Config (Full Defaults)</h2>
      <LoginButton />

      <hr style={{ margin: '2rem 0' }} />

      <LogoutButton />

      <hr style={{ margin: '2rem 0' }} />

      <h2>📋 Test 2: Partial Config Override</h2>
      <LoginWithOverride />

      <hr style={{ margin: '2rem 0' }} />

      <LogoutWithOverride />

      <hr style={{ margin: '2rem 0' }} />

      <div className="info">
        <h3>✅ Test Checklist</h3>
        <ul>
          <li>✅ No TypeScript errors</li>
          <li>✅ App starts without configuration errors</li>
          <li>✅ ClientId is auto-detected based on hostname</li>
          <li>✅ RedirectUri is auto-derived from origin</li>
          <li>✅ Login button works (opens Immutable auth)</li>
          <li>✅ Logout clears session properly</li>
          <li>⏳ Custom config overrides work</li>
        </ul>
      </div>
    </main>
  );
}
