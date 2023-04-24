import type { EventData, EventType } from 'types';
import { asyncFn } from '../utils';

// TODO: Use Checkout SDK
const Checkout = {
  connect: asyncFn('connect'),
  transfer: asyncFn('transfer', [1, 2, 3]),
  sign: asyncFn('sign'),
};

// TODO: Use Backend Service
// Backend service stub to abstract API usage
const StudioBEService = {
  validateCraft: asyncFn('validateCraft'),
  submitCraft: asyncFn('submitCraft'),
};

/** Craft action payload */
export type CraftInput = {
  requiresWeb3: boolean;
  web3Assets: Record<string, unknown>;
  // TODO: Update to include recipe payload from spec
  // https://api.dev.games.immutable.com/crafting/swagger/index.html#/
};

/**
 * @internal Craft events
 */
export type CraftEvent = EventType<
  'CRAFT',
  | EventData<'STARTED' | 'IN_PROGRESS'>
  | EventData<'COMPLETED', { data: { output: { id: string } } }>
  | EventData<'FAILED', { error: { code: string; reason: string } }>
  | EventData<
      'AWAITING_WEB3_INTERACTION' | 'VALIDATING' | 'SUBMITTED' | 'PENDING'
    >
>;

/** List of specific craft statuses */
export type CraftStatus = CraftEvent['status'];

export async function craft(
  craftInput: CraftInput,
  emitEvent: (event: CraftEvent) => void
): Promise<CraftStatus> {
  // 1. validate inputs
  emitEvent({ status: 'STARTED', action: 'CRAFT' });
  await StudioBEService.validateCraft(craftInput);

  // 2. perform any web3 actions
  let txIds: number[] = [];
  let signature;
  if (craftInput.requiresWeb3) {
    emitEvent({ status: 'AWAITING_WEB3_INTERACTION', action: 'CRAFT' });
    txIds = await Checkout.transfer(craftInput.web3Assets);
    signature = await Checkout.sign();
  }

  // 3. submit craft to BE
  emitEvent({ status: 'SUBMITTED', action: 'CRAFT' });
  await StudioBEService.submitCraft(craftInput, txIds, signature);

  // ? notify the caller of `craft` in real time the status/results

  emitEvent({
    status: 'COMPLETED',
    action: 'CRAFT',
    data: {
      output: { id: 'stirng' },
    },
  });
  return 'COMPLETED';
}
