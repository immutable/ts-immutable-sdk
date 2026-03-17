'use client';

/**
 * OAuth redirect callback - simulates Issue 2 (UI does not update after login via redirect).
 *
 * Flow:
 * 1. connectEvm() on mount → provider created with user: null
 * 2. setDefaultWalletProvider(provider) → provider in context
 * 3. loginCallback() → processes OAuth, Auth emits LOGGED_IN
 * 4. BUG: ZkEvmProvider does not listen to LOGGED_IN, does not emit ACCOUNTS_CHANGED
 * 5. Result: Status shows "Connected to ZkEvm" but activeZkEvmAccount remains empty
 */
import { useEffect, useRef, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import Link from 'next/link';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { usePassportProvider } from '@/context/PassportProvider';
import Status from '@/components/Status';
import CardStack from '@/components/CardStack';
import { BASE_PATH } from '@/config';

type LoginCallbackStatus = 'idle' | 'running' | 'success' | 'error';

export default function RedirectCallbackPage() {
  const { passportClient, environment } = useImmutableProvider();
  const { setDefaultWalletProvider, activeZkEvmProvider, activeZkEvmAccount } = usePassportProvider();
  const [stepLog, setStepLog] = useState<string[]>([]);
  const [loginCallbackStatus, setLoginCallbackStatus] = useState<LoginCallbackStatus>('idle');
  const [loginCallbackError, setLoginCallbackError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{ sub?: string; email?: string } | null>(null);
  const [userInfoChecked, setUserInfoChecked] = useState(false);
  const loginCallbackAttemptedRef = useRef(false);

  const log = (msg: string) => {
    setStepLog((prev) => [...prev, `[${new Date().toISOString().slice(11, 19)}] ${msg}`]);
  };

  useEffect(() => {
    if (!passportClient) return;

    let cancelled = false;

    const run = async () => {
      try {
        // Debug: confirm which config is being used
        const storedEnv = typeof window !== 'undefined'
          ? localStorage.getItem('IMX_PASSPORT_SAMPLE_ENVIRONMENT')
          : null;
        const debugMsg = `[DEBUG] environment in context: ${environment}, localStorage: ${storedEnv}`;
        log(debugMsg);
        console.log('RedirectCallback debug:', { environment, storedEnv });

        log('Step 1: connectEvm() - provider with user: null');
        const provider = await passportClient.connectEvm();
        if (cancelled) return;

        log('Step 2: setDefaultWalletProvider(provider)');
        setDefaultWalletProvider(provider);

        // loginCallback must be called ONLY ONCE (oidc-client consumes the state)
        if (loginCallbackAttemptedRef.current) {
          log('Step 3: loginCallback SKIP - already called (avoids "No matching state")');
          return;
        }
        loginCallbackAttemptedRef.current = true;

        log('Step 3: loginCallback() - processes OAuth from URL');
        setLoginCallbackStatus('running');
        setLoginCallbackError(null);
        await passportClient.loginCallback();
        if (cancelled) return;

        setLoginCallbackStatus('success');
        log('Step 4: loginCallback completed - Auth emitted LOGGED_IN');
        log('Provider listens to LOGGED_IN and emits ACCOUNTS_CHANGED → activeZkEvmAccount updated');
      } catch (err) {
        if (!cancelled) {
          const errMsg = err instanceof Error ? err.message : String(err);
          setLoginCallbackStatus('error');
          setLoginCallbackError(errMsg);
          log(`Error: ${errMsg}`);
          // Allows retry when passportClient changes (e.g. ImmutableProvider stabilized)
          loginCallbackAttemptedRef.current = false;
        }
      } finally {
        if (!cancelled) {
          setUserInfoChecked(true);
          try {
            const info = await passportClient.getUserInfo();
            setUserInfo((info ?? null) as { sub?: string; email?: string } | null);
          } catch {
            setUserInfo(null);
          }
        }
      }
    };

    // Short delay for ImmutableProvider to stabilize (avoid wrong default Passport)
    const timer = setTimeout(run, 50);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [passportClient, setDefaultWalletProvider, environment]);

  const callbackDone = loginCallbackStatus === 'success' || loginCallbackStatus === 'error';

  return (
    <Container className="my-4">
      <Row className="mb-3">
        <CardStack title="Issue 2: Redirect Callback Simulation">
          <p className="small text-muted mb-2">
            After Login (Google/Apple/Facebook) redirect, you were redirected here.
            The provider was created before loginCallback. After loginCallback, Auth emits LOGGED_IN,
            but ZkEvmProvider does not listen to this event, so it does not emit ACCOUNTS_CHANGED.
          </p>

          {/* Comparison: Provider exists vs User authenticated */}
          <div className="mb-3 p-2 rounded bg-light">
            <strong className="d-block mb-2">Diagnostics:</strong>
            <div className="mb-1">
              Provider exists (setDefaultWalletProvider):{' '}
              {activeZkEvmProvider ? <span className="text-success">✓ Yes</span> : <span className="text-muted">✗ Waiting</span>}
            </div>
            <div className="mb-1">
              User authenticated (getUserInfo):{' '}
              {!userInfoChecked ? (
                <span className="text-muted">Waiting for verification...</span>
              ) : userInfo ? (
                <span className="text-success">✓ Yes</span>
              ) : (
                <span className="text-danger">✗ No — login did not complete</span>
              )}
            </div>
            <div className="mb-1">
              loginCallback:{' '}
              {loginCallbackStatus === 'idle' && <span className="text-muted">Waiting...</span>}
              {loginCallbackStatus === 'running' && <span className="text-info">Running...</span>}
              {loginCallbackStatus === 'success' && <span className="text-success">✓ Completed</span>}
              {loginCallbackStatus === 'error' && <span className="text-danger">✗ Failed</span>}
            </div>
          </div>

          {/* Error or informational message */}
          {loginCallbackError && (
            <div
              className={`mb-3 p-3 rounded border ${
                loginCallbackError.includes('No matching state found in storage')
                  ? 'border-info bg-info bg-opacity-10'
                  : 'border-danger bg-danger bg-opacity-10'
              }`}
            >
              {loginCallbackError.includes('No matching state found in storage') ? (
                <p className="mb-0 text-dark">
                  The login flow was already processed. If you reloaded the page, click Back to Home.
                </p>
              ) : (
                <>
                  <strong className="text-danger">Error in loginCallback:</strong>
                  <pre className="mt-2 mb-0 small text-danger" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {loginCallbackError}
                  </pre>
                </>
              )}
            </div>
          )}

          <div className="mb-2">
            <strong>Wallet address (activeZkEvmAccount):</strong>{' '}
            {activeZkEvmAccount ? (
              <code className="text-success">{activeZkEvmAccount}</code>
            ) : (
              <span className="text-warning">
                {callbackDone
                  ? (userInfo ? 'EMPTY (Issue 2) - provider did not emit ACCOUNTS_CHANGED' : 'EMPTY - login did not complete (OAuth error)')
                  : 'Waiting for loginCallback...'}
              </span>
            )}
          </div>

          {userInfoChecked && userInfo && (
            <div className="mb-2 small">
              <strong>getUserInfo:</strong>{' '}
              <code className="text-success">{userInfo?.sub ?? userInfo?.email ?? 'authenticated user'}</code>
            </div>
          )}

          <pre className="bg-dark text-light p-2 rounded small" style={{ maxHeight: 150, overflow: 'auto' }}>
            {stepLog.length ? stepLog.join('\n') : 'Waiting...'}
          </pre>
          <Link href={BASE_PATH || '/'} className="btn btn-primary mt-2">
            Back to Home
          </Link>
        </CardStack>
      </Row>
      <Row>
        <Status />
      </Row>
    </Container>
  );
}
