import {
  BridgeWidgetParams, ConnectTargetLayer, WidgetType,
} from '@imtbl/checkout-sdk';
import { Base } from 'widgets/BaseWidgetRoot';
import { StrongCheckoutWidgetsConfig } from 'lib/withDefaultWidgetConfig';
import { ConnectLoaderParams } from 'components/ConnectLoader/ConnectLoader';
import { getL1ChainId } from 'lib';

export type BridgeWidgetInputs = BridgeWidgetParams & {
  config: StrongCheckoutWidgetsConfig
};

export class Bridge<T extends WidgetType> extends Base<T> {
  protected eventTarget: string = 'imtbl-bridge-widget';

  protected rerender() {
    this.validate(this.properties);

    const connectLoaderParams: ConnectLoaderParams = {
      targetLayer: ConnectTargetLayer.LAYER1,
      walletProvider: this.properties.params?.walletProvider,
      // web3Provider: this.provider,
      // passport: this.passport,
      allowedChains: [
        getL1ChainId(this.checkout!.config),
      ],
    };
    console.log(connectLoaderParams);
    // const params: BridgeWidgetParams = {
    //   fromContractAddress: this.fromContractAddress,
    //   amount: this.amount,
    // };

    //   if (!this.reactRoot) {
    //     this.reactRoot = ReactDOM.createRoot(this);
    //   }
    //   const showBridgeComingSoonScreen = isPassportProvider(this.provider)
    //   || this.walletProvider === WalletProviderName.PASSPORT;

  //   this.reactRoot.render(
  //     <React.StrictMode>
  //       <BiomePortalIdProvider>
  //         <CustomAnalyticsProvider
  //           widgetConfig={this.widgetConfig!}
  //         >
  //           {showBridgeComingSoonScreen && (
  //           <BiomeCombinedProviders theme={{ base: onDarkBase }}>
  //             <BridgeComingSoon onCloseEvent={() => sendBridgeWidgetCloseEvent(window)} />
  //           </BiomeCombinedProviders>
  //           )}
  //           {!showBridgeComingSoonScreen && (
  //           <ConnectLoader
  //             params={connectLoaderParams}
  //             closeEvent={() => sendBridgeWidgetCloseEvent(window)}
  //             widgetConfig={this.widgetConfig!}
  //           >
  //             <BridgeWidget
  //               params={params}
  //               config={this.widgetConfig!}
  //             />
  //           </ConnectLoader>
  //           )}
  //         </CustomAnalyticsProvider>
  //       </BiomePortalIdProvider>
  //     </React.StrictMode>,
  //   );
  }
}
