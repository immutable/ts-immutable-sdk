import { CheckoutSDK, Network } from '@imtbl/checkout-sdk-web'
import { Box, Button, Heading } from '@biom3/react'

export interface SwitchNetworkProps {
  provider: any;
}

function SwitchNetwork(props: SwitchNetworkProps) {
  const checkout:CheckoutSDK = new CheckoutSDK()
  const {provider} = props;


  async function switchNetwork(network: Network) {
    await checkout.switchNetwork({provider, network})
  }
 
  return (
    <Box>
      <Heading size="small" className="sample-heading">Checkout Connect (SDK)</Heading>
      <div className="divider"></div>
      <Box sx={{display: 'flex', flexDirection: 'column', rowGap: 'base.spacing.x1', width: '300px'}}>
        <Button 
          onClick={() => switchNetwork(Network.ETHEREUM)}>
          Switch Network to Ethereum
        </Button>
        <Button 
          onClick={() => switchNetwork(Network.GOERLI)}>
          Switch Network to Goerli
        </Button>
        <Button 
          onClick={() => switchNetwork(Network.POLYGON)}>
          Switch Network to Polygon
        </Button>
        </Box>
    </Box>
  );
}

export default SwitchNetwork;
