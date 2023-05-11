import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { SwapForm } from '../components/SwapForm';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { sendSwapWidgetCloseEvent } from '../SwapWidgetEvents';
import { text } from '../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../context/SwapViewContextTypes';
import { useContext } from 'react';
import { SwapContext } from '../context/SwapContext';

export interface SwapCoinsProps {
  amount: string | undefined;
  fromContractAddress: string | undefined;
  toContractAddress: string | undefined;
}

export const SwapCoins = ({
  amount,
  fromContractAddress,
  toContractAddress,
}: SwapCoinsProps) => {
  const { swapState } = useContext(SwapContext);
  const { allowedTokens } = swapState;
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
      />
    </SimpleLayout>
  );
};
