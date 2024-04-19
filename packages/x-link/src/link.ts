import { Link as OldLink, ConfigurableIframeOptions } from '@imtbl/imx-sdk';

import { Params, Results } from './types';

export class Link {
  private link: OldLink;

  constructor(
    webUrl = 'https://link.sandbox.x.immutable.com',
    iframeOptions: ConfigurableIframeOptions = null,
  ) {
    this.link = new OldLink(webUrl, iframeOptions);
  }

  setup = (p: Params.Setup): Promise<Results.Setup> => this.link.setup(p);

  buy = (p: Params.BuyV2): Promise<Results.BuyV2> => this.link.buy(p);

  sell = (p: Params.Sell) => this.link.sell(p);

  history = (p: Params.History) => this.link.history(p);

  deposit = (p: Params.FlexibleDeposit) => this.link.deposit(p);

  prepareWithdrawal(p: Params.PrepareWithdrawal): Promise<Results.PrepareWithdrawal> {
    return this.link.prepareWithdrawal(p);
  }

  completeWithdrawal(p: Params.CompleteWithdrawal): Promise<Results.CompleteWithdrawal> {
    return this.link.completeWithdrawal(p);
  }

  transfer = (p: Params.TransferV2): Promise<Results.TransferV2> => this.link.transfer(p);

  batchNftTransfer = (p: Params.BatchNftTransfer): Promise<Results.BatchNftTransfer> => this.link.batchNftTransfer(p);

  cancel = (p: Params.Cancel) => this.link.cancel(p);

  claim = () => this.link.claim();

  onramp = (p: Params.Onramp): Promise<Results.Onramp> => this.link.onramp(p);

  offramp = (p: Params.Offramp): Promise<Results.Offramp> => this.link.offramp(p);

  nftCheckoutPrimary(p: Params.NFTCheckoutPrimary): Promise<Results.NFTCheckoutPrimary> {
    return this.link.nftCheckoutPrimary(p);
  }

  nftCheckoutSecondary(p: Params.NFTCheckoutSecondary): Promise<Results.NFTCheckoutSecondary> {
    return this.link.nftCheckoutSecondary(p);
  }

  makeOffer = (p: Params.MakeOffer): Promise<Results.MakeOffer> => this.link.makeOffer(p);

  cancelOffer = (p: Params.CancelOffer) => this.link.cancelOffer(p);

  acceptOffer = (p: Params.AcceptOffer) => this.link.acceptOffer(p);

  sign = (p: Params.Sign): Promise<Results.Sign> => this.link.sign(p);

  getPublicKey = (p: Params.GetPublicKey): Promise<Results.GetPublicKey> => this.link.getPublicKey(p);

  /**
   * @deprecated
   * Exchange API v3 uses on 'Onramp' instead of 'FiatToCrypto'
   */
  fiatToCrypto = (p: Params.FiatToCrypto): Promise<Results.FiatToCrypto> => this.link.fiatToCrypto(p);

  /**
   * @deprecated
   * Exchange API v3 uses on 'Offramp' instead of 'CryptoToFiat'
   */
  cryptoToFiat = (p: Params.CryptoToFiat): Promise<Results.CryptoToFiat> => this.link.cryptoToFiat(p);
}
