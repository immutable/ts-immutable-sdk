export type ConnectRequest = {
  ethAddress: string;
  signature: string;
};
export type ConnectResponse = {
  starkPublicKey: string;
};

export type GetConnectionRequest = {
  etherAddress: string;
};
export type GetConnectionResponse = ConnectResponse;

export type SignMessageRequest = {
  starkPublicKey: string;
  message: string;
}
export type SignMessageResponse = {
  signedMessage: string;
}

export type DisconnectRequest = {
  starkPublicKey: string;
};
export type DisconnectResponse = {};

export enum ERROR_CODE {
  CANNOT_RETRIEVE_STARK_KEY_PAIR = 100,
  GENERIC_ERROR = 500,
}

export type Error = {
  code: ERROR_CODE;
  message: string;
};
