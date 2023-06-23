import { Checkout, ConnectionProviders, WalletProviderName } from '@imtbl/checkout-sdk';
import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { ERC20__factory } from '@imtbl/contracts/';
import { TransactionRequest } from '@ethersproject/providers';

@customElement('imtbl-primary-sales-demo')
export class PrimarySalesDemo extends LitElement {
  static styles = css``;


  handleCustomEvent<T extends Event>(listener: (event: T) => void) {
    return (event: Event) => {
      listener.call(this, event as T);
    };
  }

  connectedCallback() {
    super.connectedCallback();



    this.connect();
  }

  async connect() {
    const checkout = new Checkout();
    const resp = await checkout.createProvider({
      walletProvider: WalletProviderName.METAMASK,
    });
    const connect = await checkout.connect({provider: resp.provider});
    const provider = connect.provider;

    // const usdcAddress = '0xA40b0dA87577Cd224962e8A3420631E1C4bD9A9f'; // polygon zkevm

    const usdcAddress = '0x6f14C02Fc1F78322cFd7d707aB90f18baD3B54f5'; // sepolia
    // 0x6f14C02Fc1F78322cFd7d707aB90f18baD3B54f5

    const walletA = '0x7e562dE84C5e01cF0C098b9396b2a469AB4002e0';
    const walletB = '0x7a88d8d76a6422631C00Fc70E2CAab810B662D3d';
    
    const erc20ContractFactory = ERC20__factory.connect(usdcAddress, provider);
    console.log('@@@@@ erc20ContractFactory', erc20ContractFactory);
    
    // Approve first for wallet B
    // erc20ContractFactory.connect(provider.getSigner()).approve(walletA, 1000);
    
    // Then connect to wallet A and perform transfer on behalf of wallet B
    erc20ContractFactory.connect(provider.getSigner()).transferFrom(walletB, walletA, 1000);
    
    // note approve costs gas

    return;
    const totalSupply = await erc20ContractFactory.totalSupply();
    console.log('@@@@@ totalSupply', totalSupply.toString());

    const allowance = await erc20ContractFactory.allowance(walletA, walletB);
    console.log('@@@@@ allowance', allowance);

    console.log('@@@@@@ owner balance', (await erc20ContractFactory.balanceOf(walletA)).toString());
    console.log('@@@@@@ recipient balance', (await erc20ContractFactory.balanceOf(walletB)).toString());


  const erc20Contract = ERC20__factory.createInterface();
  const callData = erc20Contract.encodeFunctionData('approve', [walletA, 1000]);

    const nonce = await provider.getTransactionCount(walletA);
    const network = await provider.getNetwork();

    const gasPrice = await provider.getGasPrice();

  const unsignedTx: TransactionRequest = {
    data: callData,
    to: walletB,
    value: '1000',
    from: walletA,
    gasPrice: gasPrice.toString(),
    gasLimit: '1000000',
    nonce: `${nonce}`,
    chainId: network.chainId,
  }

    console.log('@@@@@ sending tx ', unsignedTx);

  const txnResult = await checkout.sendTransaction({
    provider,
    transaction: unsignedTx,
  });

  console.log('@@@@@ txnResult ', txnResult);


    // return {
    //   data: callData,
    //   to: tokenAddress,
    //   value: 0,
    //   from: ownerAddress,
    // };

    // const approveTransaction = await getApproveTransaction(
    //   provider,
    //   fromAddress,
    //   tokenInAddress,
    //   ethers.BigNumber.from(amount),
    //   this.router.routingContracts.peripheryRouterAddress,
    // );

    // const txnResult = await checkout.sendTransaction({
    //   provider,
    //   transaction: data.approveTransaction.unsignedTx,
    // });

  }


  render() {

    return html` 
      <div>
        <h1>Primary Sales Demo</h1>
      </div>`;
  }

  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }

}
