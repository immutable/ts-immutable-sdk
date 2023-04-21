import { asyncFn } from '../utils';

// import { Checkout } from "checkout-or-passport";
const Checkout = {
  connect: asyncFn('connect'),
  transfer: asyncFn('transfer', [1, 2, 3]),
  sign: asyncFn('sign'),
};

// Backend service stub to abstract API usage
const StudioBEService = {
  validateCraft: asyncFn('validateCraft'),
  submitCraft: asyncFn('submitCraft'),
};

export type CraftInput = {
  requiresWeb3: boolean;
  web3Assets: Record<string, unknown>;
};

/** List of valid craft status values */
export enum CraftStatuses {
  'AWAITING_WEB3_INTERACTION' = 'AWAITING_WEB3_INTERACTION',
  'VALIDATING' = 'VALIDATING',
  'SUBMITTED' = 'SUBMITTED',
  'PENDING' = 'PENDING',
  'COMPLETE' = 'COMPLETE',
  'ERROR' = 'ERROR',
}
export type CraftStatus = keyof typeof CraftStatuses;

export async function craft(
  craftInput: CraftInput,
  onEvents: (status: CraftStatus) => void
): Promise<CraftStatus> {
  // 1. validate inputs
  onEvents('VALIDATING');
  await StudioBEService.validateCraft(craftInput);

  // 2. perform any web3 actions
  let txIds: number[] = [];
  let signature;
  if (craftInput.requiresWeb3) {
    onEvents('AWAITING_WEB3_INTERACTION');
    txIds = await Checkout.transfer(craftInput.web3Assets);
    signature = await Checkout.sign();
  }

  // 3. submit craft to BE
  onEvents('SUBMITTED');
  await StudioBEService.submitCraft(craftInput, txIds, signature);

  // ? notify the caller of `craft` in real time the status/results

  onEvents('COMPLETE');
  return 'COMPLETE';
}
