import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConnectWidget } from './ConnectWidget';
import { ConnectWidgetOptions } from '@imtbl/checkout-ui-types'
export default class IMTBLConnectWidget {

  static reactRoot?:ReactDOM.Root

  static mount(options:ConnectWidgetOptions) {

    function doRender() {
      if (IMTBLConnectWidget.reactRoot) {
        //throw new Error('IMTBLConnectWidget is already mounted, unmount first');
      }

      const element = document.getElementById(options.elementId) as HTMLElement

      if (!element) {
        throw new Error(`element with id "${options.elementId}" not found in DOM`);
      }

      const root = ReactDOM.createRoot(element);

      root.render(
        <React.StrictMode>
          <ConnectWidget params={options.params} elementId={options.elementId} theme={options.theme} />
        </React.StrictMode>
      );

      IMTBLConnectWidget.reactRoot = root

    }

    if (document.readyState === 'complete') {
      doRender();
    } else {
      window.addEventListener('load', () => {
        doRender();
      });
    }     

  }//mount

  static unmount() {
    if (!IMTBLConnectWidget.reactRoot) {
      throw new Error('IMXConnectWidget is not mounted, mount first');
    }
    IMTBLConnectWidget.reactRoot.unmount()
    delete IMTBLConnectWidget.reactRoot
  }
}