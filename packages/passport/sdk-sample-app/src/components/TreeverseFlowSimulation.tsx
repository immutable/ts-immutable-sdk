'use client';

/**
 * Simulates the flow reported by Treeverse (Issue 1).
 *
 * Expected flow:
 * 1. connectEvm() in useEffect (obtain provider) - no popup on load
 * 2. getUserInfo() to check session
 * 3. eth_requestAccounts only if user exists AND no accounts loaded
 *
 * Fix: connectWallet uses getUser(undefined, { silent: true }) in setup,
 * avoiding popup on first load. Popup opens only when clicking Connect.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Stack } from 'react-bootstrap';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { usePassportProvider } from '@/context/PassportProvider';
import { useStatusProvider } from '@/context/StatusProvider';
import CardStack from '@/components/CardStack';
import WorkflowButton from '@/components/WorkflowButton';

export default function TreeverseFlowSimulation() {
  const [provider, setProvider] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [stepLog, setStepLog] = useState<string[]>([]);
  const { passportClient } = useImmutableProvider();
  const { addMessage, setIsLoading } = useStatusProvider();

  const log = useCallback((msg: string) => {
    setStepLog((prev) => [...prev, `[${new Date().toISOString().slice(11, 19)}] ${msg}`]);
    addMessage('TreeverseFlow', msg);
  }, [addMessage]);

  // Simulates Treeverse useEffect: connectEvm + getUserInfo on mount
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        log('Step 1: connectEvm() (no popup on load)');
        setIsLoading(true);
        const p = await passportClient.connectEvm();
        if (cancelled) return;
        setProvider(p);
        log('Step 1 done: provider obtained');

        log('Step 2: getUserInfo()');
        const info = await passportClient.getUserInfo();
        if (cancelled) return;
        setUserInfo(info);
        log(`Step 2 done: userInfo=${info ? 'exists' : 'null'}`);

        // Step 3: eth_requestAccounts only if user exists (Treeverse: "and no accounts loaded")
        if (info) {
          log('Step 3: eth_requestAccounts (user exists)');
          const accs = await p.request({ method: 'eth_requestAccounts' });
          if (cancelled) return;
          setAccounts(accs || []);
          log(`Step 3 done: accounts=${(accs || []).length}`);
        } else {
          log('Step 3: skipped (no user - expected for first load)');
        }
      } catch (err) {
        if (!cancelled) {
          log(`Error: ${err instanceof Error ? err.message : String(err)}`);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleManualConnect = useCallback(async () => {
    if (!provider) return;
    try {
      setIsLoading(true);
      const accs = await provider.request({ method: 'eth_requestAccounts' });
      setAccounts(accs || []);
      addMessage('Manual connect', accs?.[0] || 'No accounts');
    } catch (err) {
      addMessage('Manual connect', err);
    } finally {
      setIsLoading(false);
    }
  }, [provider, addMessage, setIsLoading]);

  return (
    <CardStack title="Treeverse Flow Simulation (Issue 1)">
      <Stack direction="horizontal" gap={3} className="flex-wrap">
        <WorkflowButton onClick={handleManualConnect} disabled={!provider}>
          Manual: eth_requestAccounts
        </WorkflowButton>
      </Stack>
      <div className="mt-2">
        <small className="text-muted">Step log:</small>
        <pre className="bg-dark text-light p-2 rounded small" style={{ maxHeight: 120, overflow: 'auto' }}>
          {stepLog.length ? stepLog.join('\n') : 'Waiting...'}
        </pre>
      </div>
      <div className="mt-2 small">
        <div>Provider: {provider ? '✓' : '✗'}</div>
        <div>UserInfo: {userInfo ? '✓' : '✗'}</div>
        <div>Accounts: {accounts.length ? accounts[0] : 'none'}</div>
      </div>
    </CardStack>
  );
}
