import { Modal, ModalContent, theme } from '@chakra-ui/react'
import { BridgeEventType, ConnectEventType, ConnectionSuccess, OnRampEventType, OrchestrationEventType, ProviderEventType, ProviderUpdated, RequestBridgeEvent, RequestOnrampEvent, RequestSwapEvent, SwapEventType, WalletEventType, WidgetType } from '@imtbl/sdk/checkout'
import { CheckoutContext } from '../../contexts/CheckoutContext';
import { useContext, useEffect } from 'react';
import { EIP1193Context } from '../../contexts/EIP1193Context';

interface WidgetModal {
  widgetType: WidgetType;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

function WidgetModal({
  widgetType,
  isOpen,
  onClose
}: WidgetModal) {
  const {setProvider} = useContext(EIP1193Context);
  const {widgets: {connect, wallet, bridge, swap, onramp}} = useContext(CheckoutContext);

  useEffect(() => {
    if(!connect || !wallet || !bridge || !swap || !onramp || !isOpen) return;

    connect.addListener(ConnectEventType.CLOSE_WIDGET, () => {
      onClose();
      connect.unmount();
    })
    wallet.addListener(WalletEventType.CLOSE_WIDGET, () => {
      onClose();
      wallet.unmount();
    })
    swap.addListener(SwapEventType.CLOSE_WIDGET, () => {
      onClose();
      swap.unmount();
    })
    bridge.addListener(BridgeEventType.CLOSE_WIDGET, () => {
      onClose();
      bridge.unmount();
    })
    onramp.addListener(OnRampEventType.CLOSE_WIDGET, () => {
      onClose();
      onramp.unmount();
    })

    switch(widgetType) {
      case WidgetType.CONNECT: {
        connect.addListener(ConnectEventType.SUCCESS, (data: ConnectionSuccess) => {
          onClose();
          connect.unmount();
          setProvider(data.provider);
        })
        connect.addListener(ProviderEventType.PROVIDER_UPDATED, (data: ProviderUpdated) => {
          setProvider(data.provider);
        })
        // Hack to get to render
        const render = Promise.resolve();
        render.then(() => connect.mount('widget-target'))
        break;
      }
      case WidgetType.WALLET: {
        wallet.addListener(WalletEventType.DISCONNECT_WALLET, () => {
          wallet.unmount();
          // logout();
        })
        wallet.addListener(OrchestrationEventType.REQUEST_BRIDGE, (data: RequestBridgeEvent) => {
          wallet.unmount();
          bridge.mount('widget-target', {...data})
        })
        wallet.addListener(OrchestrationEventType.REQUEST_SWAP, (data: RequestSwapEvent) => {
          wallet.unmount();
          swap.mount('widget-target', {...data})
        })
        wallet.addListener(OrchestrationEventType.REQUEST_ONRAMP, (data: RequestOnrampEvent) => {
          wallet.unmount();
          onramp.mount('widget-target', {...data})
        });

        // Hack to get to render
        const render = Promise.resolve();
        render.then(() => wallet.mount('widget-target'))
        break;
      }
    }
  }, [
    isOpen, 
    widgetType, 
    connect, 
    wallet, 
    bridge, 
    swap, 
    onramp, 
    onClose, 
    setProvider]
  );

  return (
    <Modal isOpen={isOpen} closeOnOverlayClick={false} onClose={onClose} isCentered>
      <ModalContent id="widget-target" h="650px" w="430px" bgColor={theme.colors.black}>
        <div id="widget-target" />
      </ModalContent>
    </Modal>
  )
}

export default WidgetModal