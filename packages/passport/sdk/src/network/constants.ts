import { ChainId, ChainName } from './chains';

export type ChainMap = Map<ChainId, ChainName>;
export const CHAIN_NAME_MAP: ChainMap = new Map<
ChainId,
ChainName
>([
  [
    ChainId.ETHEREUM,
    ChainName.ETHEREUM,
  ],
  [
    ChainId.SEPOLIA,
    ChainName.SEPOLIA,
  ],
  [
    ChainId.IMTBL_ZKEVM_MAINNET,
    ChainName.IMTBL_ZKEVM_MAINNET,
  ],
  [
    ChainId.IMTBL_ZKEVM_TESTNET,
    ChainName.IMTBL_ZKEVM_TESTNET,
  ],
  [
    ChainId.IMTBL_ZKEVM_DEVNET,
    ChainName.IMTBL_ZKEVM_DEVNET,
  ],
]);
