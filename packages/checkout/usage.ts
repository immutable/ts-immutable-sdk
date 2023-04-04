// //----------------------------------//
// // Buy asset with Checkout SDK (UI) //
// //----------------------------------//

// //This is pseudo code and simply here for scoping purposes

// import { CheckoutSDK, WalletManager, BuyOptionsStatus, Config as CheckoutConfig } from '@imbl/checkout/core'
// import { CheckoutWidgets, WidgetParams } from '@imbl/checkout/ui'
// import { ImmutableX, Config as IMXConfig } from '@imtbl/core-sdk'

// // Build IMX client 
// const imxClient = new ImmutableX(IMXConfig.SANDBOX);

// // Build WalletManager 
// const walletManager = new WalletManager({ env: "STARKEX", stage: CheckoutConfig.SANDBOX });

// // Get asset order
// const orderID = await (async () => {
//   const orders = imxClient.sellAssetId({
//     sellTokenAddress: '0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990',
//     sellAssetId: 99888877
//   })
//   return orders[0]
// })()

// // Get asset
// const asset = await (async () => imxClient.getAsset({
//   tokenAddress: '0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990',
//   assetId: 99888877
// }))()

// const checkoutUI = new CheckoutWidgets({ walletManager: WalletManager })

// const buyFlow = async () => {
//   // Build Checkout UI
//   // If not connected allow user to connect
//   if (!walletManager.isConnected()) {
//     const connectionResponse = await checkoutUI.connectBtn({
//       render: '#imx-connect',
//       provider: walletManager,

//     } as WidgetParams)
//     if (!connectionResponse.connected()) {
//       console.error('wallet not connected')
//       return
//     }
//   }

//   const getBuyUptionsResponse = await CheckoutSDK.getAvailableBuyOptions({
//     orderID: orderID,
//     provider: walletManager,
//   })

//   if(getBuyUptionsResponse.buyFlows.length < 1) {
//     console.error('no buy options available')
//     return
//   }

//   const buyOptionsResponse = await checkoutUI.showBuyFlowOptions({
//     render: '#imx-buy-options',
//     options: getBuyUptionsResponse.buyFlows,
    
//   } as WidgetParams)

//   const canCompleteResponse = await CheckoutSDK.canCompleteOrder({
//     orderID: orderID,
//     provider: walletManager,
//     selectedBuyFlow: //
//   })

//   if (canCompleteResponse.status !== BuyOptionsStatus.BUY_NOW) {
//     //render whatever widget is next in the order of the flow they chose e.g.
//     const step0Response = await checkoutUI[buyOptionsResponse.steps[0]]({
//       render: '#imx-onramp',
//       provider: walletManager,
//     })

//     const step1Response = await checkoutUI[buyOptionsResponse.steps[1]]({
//       render: '#imx-bridge',
//       provider: walletManager,
//     })

//     const step2Response = await checkoutUI[buyOptionsResponse.steps[2]]({
//       render: '#imx-swap',
//       provider: walletManager,
//     })
//   }

//   const canCompleteResponseCheck = await CheckoutSDK.canCompleteOrder({
//     orderID: orderID,
//     provider: walletManager,
//   })

//   if (canCompleteResponseCheck.status !== BuyOptionsStatus.BUY_NOW) {
//     console.error('still unable to proceed with purchse')
//     return
//   }

//   const buyResponse = await CheckoutSDK.buy({
//     orderID: orderID,
//     provider: walletManager,
//   })

//   if (buyResponse.status === BuyOptionsStatus.COMPLETE) {
//     const buyResponse = await checkoutUI.complete({
//       render: '#imx-complete',
//       orderID,
//       provider: walletManager,
      
//     } as WidgetParams)
//   }

//   //possibly we could simply call .next() but perhaps that's for the smart checkout flow? 
  
//   checkoutUI.next({
//     render: '#imx-checkout',
//     provider: walletManager,
//   })
  
// }
