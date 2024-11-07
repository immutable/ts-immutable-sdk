import { trackFlow, utils as metricsUtils, trackError } from '@imtbl/metrics';
import { CheckResponse, get, setupClient } from './request';
import { errorBoundary } from './errorBoundary';
import { AccountsRequestedEvent } from '../../types';
import { Interface } from 'ethers';

// Local Storage Keys
const { getItem, setItem } = metricsUtils.localStorage;
const SESSION_ACTIVITY_COUNT_KEY = 'sessionActivitySendCount';
const SESSION_ACTIVITY_DAY_KEY = 'sessionActivityDate';

// Maintain a few local counters for session activity
let checkCount = 0;
let sendCount = 0;
let currentSessionTrackCall = false;

// Sync sendCount to localStorage
const syncSendCount = () => {
  sendCount = getItem(SESSION_ACTIVITY_COUNT_KEY) || 0;
  const sendDay = getItem(SESSION_ACTIVITY_DAY_KEY);

  // If no day, set count to zero. If not today, reset sendCount to 0
  const today = new Date().toISOString().split('T')[0];
  if (!sendDay || sendDay !== today) {
    sendCount = 0;
  }

  setItem(SESSION_ACTIVITY_DAY_KEY, today);
  setItem(SESSION_ACTIVITY_COUNT_KEY, sendCount);
};
// Run as soon as module initialised.
syncSendCount();

const incrementSendCount = () => {
  syncSendCount();
  sendCount++;
  setItem(SESSION_ACTIVITY_COUNT_KEY, sendCount);
  // Reset checkCount to zero on sending
  checkCount = 0;
};

// Fix no-promise-executor-return
const wait = async (seconds: number) => new Promise((resolve) => {
  setTimeout(resolve, seconds * 1000);
});

const trackSessionActivityFn = async (args: AccountsRequestedEvent) => {
  // Use an existing flow if one is provided, or create a new one
  const flow = args.flow || trackFlow('passport', 'sendSessionActivity');
  // If there is already a tracking call in progress, do nothing
  if (currentSessionTrackCall) {
    flow.addEvent('Existing Delay Early Exit');
    return;
  }
  currentSessionTrackCall = true;

  const { sendTransaction, environment } = args;
  if (!sendTransaction) {
    throw new Error('No sendTransaction function provided');
  }
  // Used to set up the request client
  if (!environment) {
    throw new Error('No environment provided');
  }
  setupClient(environment);

  const clientId = args.passportClient;
  if (!clientId) {
    flow.addEvent('No Passport Client ID');
    throw new Error('No Passport Client ID provided');
  }

  const from = args.walletAddress;
  if (!from) {
    flow.addEvent('No Passport Wallet Address');
    throw new Error('No wallet address');
  }
  //   Return type of get
  let details: CheckResponse | undefined;

  // Make the API call
  try {
    flow.addEvent('Fetching details');
    details = await get({
      clientId,
      wallet: from,
      checkCount,
      sendCount,
    });
    checkCount++;
    flow.addEvent('Fetched details', { checkCount });

    if (!details) {
      flow.addEvent('No details found');
      return;
    }
  } catch (error) {
    flow.addEvent('Failed to fetch details');
    throw new Error('Failed to get details', { cause: error });
  }

  if (details && details.contractAddress && details.functionName) {
    const contractInterface = () => new Interface([`function ${details!.functionName}()`]);
    const data = contractInterface().encodeFunctionData(details.functionName);
    const to = details.contractAddress;

    // If transaction payload, send transaction
    try {
      flow.addEvent('Start Sending Transaction');
      const tx = await args.sendTransaction([{ to, from, data }], flow);
      incrementSendCount();
      flow.addEvent('Transaction Sent', { tx });
    } catch (error) {
      flow.addEvent('Failed to send Transaction');
      const err = new Error('Failed to send transaction', { cause: error });
      trackError('passport', 'sessionActivityError', err);
    }
  }

  // if delay, perform delay.
  if (details && details.delay && details.delay > 0) {
    flow.addEvent('Delaying Transaction', { delay: details.delay });
    await wait(details.delay);
    setTimeout(() => {
      flow.addEvent('Retrying after Delay');
      currentSessionTrackCall = false;
      // eslint-disable-next-line
      trackSessionWrapper({ ...args, flow });
    }, 0);
  }
};

// Wrapper design to ensure that after track function is called, current session Track call is false.
const trackSessionWrapper = (args: AccountsRequestedEvent) => errorBoundary(trackSessionActivityFn)(args).then(() => {
  currentSessionTrackCall = false;
});

export const trackSessionActivity = trackSessionWrapper;
