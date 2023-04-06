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

export type ICraftStatus =
  | 'AWAITING_WEB3_INTERACTION'
  | 'SUBMITTED'
  | 'PENDING'
  | 'COMPLETE'
  | 'ERROR';

export async function craft(craftInput: CraftInput): Promise<ICraftStatus> {
  // 1. validate inputs
  await StudioBEService.validateCraft(craftInput);

  // 2. perform any web3 actions
  let txIds: number[] = [];
  let signature;
  if (craftInput.requiresWeb3) {
    txIds = await Checkout.transfer(craftInput.web3Assets);
    signature = await Checkout.sign();
  }

  // 3. submit craft to BE
  await StudioBEService.submitCraft(craftInput, txIds, signature);

  // ? notify the caller of `craft` in real time the status/results

  return 'COMPLETE';
}

/** List of valid craft status values */
export const craftStatuses: ICraftStatus[] = [
  'AWAITING_WEB3_INTERACTION',
  'SUBMITTED',
  'PENDING',
  'COMPLETE',
  'ERROR',
];
