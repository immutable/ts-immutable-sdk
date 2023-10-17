import { Checkout } from '@imtbl/checkout-sdk';
import { Bridge, Connect } from '@imtbl/checkout-widgets'
import { useEffect, useMemo } from 'react';

function BridgeUI() {
  const checkout = useMemo(() => new Checkout(), []);

  const connect = useMemo(() => new Connect(checkout, {}, {}),[checkout])
  const bridge = useMemo(() => new Bridge(checkout, {}, {fromContractAddress: '0x2Fa06C6672dDCc066Ab04631192738799231dE4a'}),[checkout])
  
  useEffect(() => {
    connect.mount('connect');
    bridge.mount("bridge")
  }, [bridge])
  


  return (
    <div>
      <h1 className="sample-heading">Checkout Bridge</h1>
      <div id="connect"></div>
      <div id="bridge"></div>
    </div>
  );
}

export default BridgeUI;
