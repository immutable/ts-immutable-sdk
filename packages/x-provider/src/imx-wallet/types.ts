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

export type GetYCoordinateMessageRequest = {
  starkPublicKey: string;
};
export type GetYCoordinateMessageResponse = {
  yCoordinate: string;
};

export type DisconnectRequest = {
  starkPublicKey: string;
};

export type DisconnectResponse = object;

export enum ErrorCode {
  CANNOT_RETRIEVE_STARK_KEY_PAIR = 100,
  GENERIC_ERROR = 500,
}

export type Error = {
  code: ErrorCode;
  message: string;
};
