import { createContext } from 'react';
import { Web3Modal } from './web3ModalTypes';

interface Web3ModalContextState {
  web3Modal: Web3Modal | null;
}
const web3ModalContextInitialState = {
  web3Modal: null,
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Web3ModalContext = createContext<Web3ModalContextState>(web3ModalContextInitialState);
