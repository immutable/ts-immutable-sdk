import { Checkout } from "@imtbl/checkout-sdk-web";
import { useEffect, useMemo } from "react";

function checkConnection(props: {updater: any}) {
  const {updater} = props;
  const checkout = useMemo(() => new Checkout(), []);

  useEffect(() => {
    const checky = async ()=> {
      const connected = await checkout.checkIsWalletConnected();
      console.log('isConnected: ', connected);
    };

    checky();
  }, [updater]);

  return(
    <div>Connection checker</div>
  )
  
}

export default checkConnection;