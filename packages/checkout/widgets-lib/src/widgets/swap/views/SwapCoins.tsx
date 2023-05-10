import { ConnectResult, TokenInfo } from '@imtbl/checkout-sdk';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { SwapForm } from '../components/SwapForm';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { sendSwapWidgetCloseEvent } from '../SwapWidgetEvents';
export interface SwapCoinsProps {
  allowedTokens: TokenInfo[];
  amount: string | undefined;
  fromContractAddress: string | undefined;
  toContractAddress: string | undefined;
  connection: ConnectResult | undefined;
}
export const SwapCoins = ({
  allowedTokens,
  amount,
  fromContractAddress,
  toContractAddress,
  connection,
}: SwapCoinsProps) => {
  return (
    <SimpleLayout
      header={
        <HeaderNavigation
          title="Swap coins"
          onCloseButtonClick={() => sendSwapWidgetCloseEvent()}
        />
      }
      footer={<FooterLogo />}
    >
      <SwapForm
        allowedTokens={allowedTokens}
        amount={amount}
        fromContractAddress={fromContractAddress}
        toContractAddress={toContractAddress}
        connection={connection}
      />
    </SimpleLayout>
  );
};
