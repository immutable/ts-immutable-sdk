export type ConnectRequest = {
  ethAddress: string;
  signature: string;
};
export type ConnectResponse = {
  starkPublicKey: string;
};

export type SignMessageRequest = {
  starkPublicKey: string;
  message: string;
};
export type SignMessageResponse = {
  signedMessage: string;
};

export type DisconnectRequest = {
  starkPublicKey: string;
};
// should it be empty object?
export type DisconnectResponse = object;

export enum ERROR_CODE {
  CANNOT_RETRIEVE_STARK_KEY_PAIR = 100,
  GENERIC_ERROR = 500,
}

export type Error = {
  code: ERROR_CODE;
  message: string;
};
