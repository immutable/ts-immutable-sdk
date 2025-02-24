import { checkout } from '@imtbl/sdk';
import { EventEmitter } from "events";

export class MockProvider extends EventEmitter {
  private connected: boolean = true;
  private chainId: string | checkout.ChainId = checkout.ChainId.IMTBL_ZKEVM_TESTNET;
  private accounts: string[] = [];

  constructor(
    chainId: string | checkout.ChainId = checkout.ChainId.IMTBL_ZKEVM_TESTNET,
    accounts: string[] = ["0x1234567890123456789012345678901234567890"]
  ) {
    super();
    this.chainId = chainId;
    this.accounts = accounts;
  }

  async request({
    method,
    params,
  }: {
    method: string;
    params?: any[];
  }): Promise<any> {
    switch (method) {
      case "eth_chainId":
        return this.chainId;

      case "eth_accounts":
        return this.accounts;

      case "eth_requestAccounts":
        if (!this.connected) {
          throw new Error("User rejected the request.");
        }
        return this.accounts;

      case "eth_getBalance":
        return "0x1000000000000000000";

      case "net_version":
        return this.chainId

      case "eth_blockNumber":
        return "0x1000000";

      case "eth_getCode":
        return "0x";

      case "eth_call":
        return "0x";

      case "eth_estimateGas":
        return "0x0";

      case "eth_gasPrice":
        return "0x0";

      case "eth_sendTransaction":
        return "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234";

      default:
        console.log(
          `[MockBrowserProvider] Unmocked method called: ${method}`,
          params
        );
        return null;
    }
  }

  on(eventName: string, listener: (...args: any[]) => void): this {
    super.on(eventName, listener);
    return this;
  }

  removeListener(eventName: string, listener: (...args: any[]) => void): this {
    super.removeListener(eventName, listener);
    return this;
  }

  public async simulateAccountsChanged(accounts: string[]) {
    this.accounts = accounts;
    this.emit("accountsChanged", accounts);
  }

  public async simulateChainChanged(chainId: string | checkout.ChainId) {
    this.chainId = chainId;
    this.emit("chainChanged", chainId);
  }

  public async simulateConnect() {
    this.connected = true;
    this.emit("connect", { chainId: this.chainId });
  }

  public async simulateDisconnect() {
    this.connected = false;
    this.emit("disconnect");
  }
}
