import { ConnectResult, TokenInfo } from '@imtbl/checkout-sdk';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { SwapForm } from '../components/SwapForm';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { sendSwapWidgetCloseEvent } from '../SwapWidgetEvents';
import { text } from '../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';

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
  const { title } = text.views[SwapWidgetViews.SWAP].header;
  return (
    <SimpleLayout
      header={
        <HeaderNavigation
          title={title}
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
