import {  
  IMTBLWidgetEvents, 
  ConnectEvent, 
  ConnectionSuccess, 
  ConnectionFailed, 
  ConnectEventType 
} from '@imtbl/checkout-ui-types'

import { ConnectionProviders } from '@imtbl/checkout-sdk-web'

import { addToLocalStorage } from '../../lib'

export function sendConnectSuccessEvent(providerPreference: ConnectionProviders){
  addToLocalStorage('providerPreference', providerPreference)
  const successEvent = new CustomEvent<ConnectEvent<ConnectionSuccess>>(IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT , {
    detail: {
      type: ConnectEventType.SUCCESS,
      data: {
        providerPreference: providerPreference,
        timestamp: new Date().getTime()
      }
    }
  })
  if(window !== undefined) window.dispatchEvent(successEvent)
}

export function sendConnectFailedEvent(reason: string){
  const successEvent = new CustomEvent<ConnectEvent<ConnectionFailed>>(IMTBLWidgetEvents.IMTBL_CONNECT_WIDGET_EVENT, {
    detail: {
      type: ConnectEventType.FAILURE,
      data: {
        reason,
        timestamp: new Date().getTime()
      }
    }
  })
  if(window !== undefined) window.dispatchEvent(successEvent)
}
