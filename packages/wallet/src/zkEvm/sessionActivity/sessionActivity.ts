import { track } from '@imtbl/metrics';
import { encodeFunctionData, parseAbi } from 'viem';
import { CheckResponse, get, setupClient } from './request';
import { errorBoundary } from './errorBoundary';
import { AccountsRequestedEvent } from '../../types';
import { getItem, setItem } from './storage';

const SESSION_ACTIVITY_COUNT_KEY = 'sessionActivitySendCount';
const SESSION_ACTIVITY_DAY_KEY = 'sessionActivityDate';

// Maintain a few local counters for session activity
const checkCount: { [k: string]: number } = {};
let sendCount: { [k: string]: number } = {};
const currentSessionTrackCall: { [k: string]: boolean } = {};

// Sync sendCount to localStorage
const syncSendCount = () => {
  sendCount = getItem(SESSION_ACTIVITY_COUNT_KEY) || {};
  const sendDay = getItem(SESSION_ACTIVITY_DAY_KEY);

  // If no day, init sendCount. If not today, reset sendCount
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
  const dd = `${date.getDate()}`.padStart(2, '0');
  const today = `${yyyy}-${mm}-${dd}`;
  if (!sendDay || sendDay !== today) {
    sendCount = {};
  }

  setItem(SESSION_ACTIVITY_DAY_KEY, today);
  setItem(SESSION_ACTIVITY_COUNT_KEY, sendCount);
};
// Run as soon as module initialised.
syncSendCount();

const incrementSendCount = (clientId: string) => {
  syncSendCount();
  if (!sendCount[clientId]) {
    sendCount[clientId] = 0;
  }
  sendCount[clientId]++;
  setItem(SESSION_ACTIVITY_COUNT_KEY, sendCount);
  // Reset checkCount to zero on sending
  checkCount[clientId] = 0;
};

// Fix no-promise-executor-return
const wait = async (seconds: number) => new Promise((resolve) => {
  setTimeout(resolve, seconds * 1000);
});

const trackSessionActivityFn = async (args: AccountsRequestedEvent) => {
  track('passport', 'sendSessionActivity');
  const clientId = args.passportClient;
  if (!clientId) {
    throw new Error('No Passport Client ID provided');
  }
  // If there is already a tracking call in progress, do nothing
  if (currentSessionTrackCall[clientId]) {
    return;
  }
  currentSessionTrackCall[clientId] = true;

  const { sendTransaction, sessionActivityApiUrl } = args;
  if (!sendTransaction) {
    throw new Error('No sendTransaction function provided');
  }
  // Used to set up the request client
  if (!sessionActivityApiUrl) {
    throw new Error('No session activity API URL provided');
  }
  setupClient(sessionActivityApiUrl);

  const from = args.walletAddress;
  if (!from) {
    throw new Error('No wallet address');
  }
  //   Return type of get
  let details: CheckResponse | undefined;

  // Make the API call
  try {
    details = await get({
      clientId,
      wallet: from,
      checkCount: checkCount[clientId] || 0,
      sendCount: sendCount[clientId] || 0,
    });
    checkCount[clientId]++;

    if (!details) {
      return;
    }
  } catch (error) {
    throw new Error('Failed to get details', { cause: error });
  }

  if (details && details.contractAddress && details.functionName) {
    // Use viem's encodeFunctionData
    const abi = parseAbi([`function ${details.functionName}()`]);
    const data = encodeFunctionData({
      abi,
      functionName: details.functionName,
    });
    const to = details.contractAddress;

    // If transaction payload, send transaction
    try {
      await args.sendTransaction([{ to, from, data }]);
      incrementSendCount(clientId);
    } catch (error) {
      const err = new Error('Failed to send transaction', { cause: error });
      track('passport', 'sessionActivityError', { error: err });
    }
  }

  // if delay, perform delay.
  if (details && details.delay && details.delay > 0) {
    await wait(details.delay);
    setTimeout(() => {
      currentSessionTrackCall[clientId] = false;
      // eslint-disable-next-line
      trackSessionWrapper(args);
    }, 0);
  }
};

// Wrapper design to ensure that after track function is called, current session Track call is false.
const trackSessionWrapper = (args: AccountsRequestedEvent) => errorBoundary(trackSessionActivityFn)(args).then(() => {
  currentSessionTrackCall[args.passportClient] = false;
});

export const trackSessionActivity = trackSessionWrapper;
