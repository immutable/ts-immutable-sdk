export const LINK_MESSAGE_TYPE = 'imx-link';
export const messageTypes = {
  inProgress: 'inProgress',
  success: 'success',
  fail: 'fail',
  result: 'result',
  close: 'close',
  ready: 'ready',
  transfer: 'transfer',
  batchNftTransfer: 'batchNftTransfer',
  sign: 'sign',
  getPublicKey: 'getPublicKey',
  // Triggered by the parent window for the parent window itself when a new
  // subscriber to link events is registered. Used to make sure there's always
  // only one subscriber to a Link window.
  newSubscriber: 'newSubscriber',
  info: 'info',
};
