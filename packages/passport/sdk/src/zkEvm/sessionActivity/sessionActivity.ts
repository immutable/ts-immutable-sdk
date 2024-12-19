import { trackFlow, utils as metricsUtils, trackError } from '@imtbl/metrics';
import { utils } from 'ethers';
import { CheckResponse, get, setupClient } from './request';
import { errorBoundary } from './errorBoundary';
import { AccountsRequestedEvent } from '../../types';

// Local Storage Keys
const { getItem, setItem } = metricsUtils.localStorage;
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
  // Use an existing flow if one is provided, or create a new one
  const flow = args.flow || trackFlow('passport', 'sendSessionActivity');
  const clientId = args.passportClient;
  if (!clientId) {
    flow.addEvent('No Passport Client ID');
    throw new Error('No Passport Client ID provided');
  }
  // If there is already a tracking call in progress, do nothing
  if (currentSessionTrackCall[clientId]) {
    flow.addEvent('Existing Delay Early Exit');
    return;
  }
  currentSessionTrackCall[clientId] = true;

  const { sendTransaction, environment } = args;
  if (!sendTransaction) {
    throw new Error('No sendTransaction function provided');
  }
  // Used to set up the request client
  if (!environment) {
    throw new Error('No environment provided');
  }
  setupClient(environment);

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
      checkCount: checkCount[clientId] || 0,
      sendCount: sendCount[clientId] || 0,
    });
    checkCount[clientId]++;
    flow.addEvent('Fetched details', { checkCount: checkCount[clientId] });

    if (!details) {
      flow.addEvent('No details found');
      return;
    }
  } catch (error) {
    flow.addEvent('Failed to fetch details');
    throw new Error('Failed to get details', { cause: error });
  }

  if (details && details.contractAddress && details.functionName) {
    const contractInterface = () => new utils.Interface([`function ${details!.functionName}()`]);
    const data = contractInterface().encodeFunctionData(details.functionName);
    const to = details.contractAddress;

    // If transaction payload, send transaction
    try {
      flow.addEvent('Start Sending Transaction');
      const tx = await args.sendTransaction([{ to, from, data }], flow);
      incrementSendCount(clientId);
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
      currentSessionTrackCall[clientId] = false;
      // eslint-disable-next-line
      trackSessionWrapper({ ...args, flow });
    }, 0);
  }
};

// Wrapper design to ensure that after track function is called, current session Track call is false.
const trackSessionWrapper = (args: AccountsRequestedEvent) => errorBoundary(trackSessionActivityFn)(args).then(() => {
  currentSessionTrackCall[args.passportClient] = false;
});

export const trackSessionActivity = trackSessionWrapper;
