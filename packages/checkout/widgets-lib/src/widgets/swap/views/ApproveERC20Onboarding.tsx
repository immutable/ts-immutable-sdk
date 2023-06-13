import { Box } from '@biom3/react';
import { useMemo, useState } from 'react';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { sendSwapWidgetCloseEvent } from '../SwapWidgetEvents';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { text } from '../../../resources/text/textConfig';
import { SwapWidgetViews } from '../../../context/view-context/SwapViewContextTypes';
import { IMXCoinsHero } from '../../../components/Hero/IMXCoinsHero';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { ImmutableNetworkHero } from '../../../components/Hero/ImmutableNetworkHero';

export function ApproveERC20Onboarding() {
  const { approveSpending, approveSwap } = text.views[SwapWidgetViews.APPROVE_ERC20];

  // can only show approve spending else show approve swap
  const [showApproveSpendingStep, setShowApproveSpendingStep] = useState(true);

  // if user rejects transactions
  const [rejectedSpending, setRejectedSpending] = useState(false);
  const [rejectedSwap, setRejectedSwap] = useState(false);

  const approveSpendHint = '110 GOG';

  // Approve spending step
  const approveSpendContent = (
    <SimpleTextBody heading={approveSpending.content.heading}>
      <Box>{`${approveSpending.content.body[0]} ${approveSpendHint} ${approveSpending.content.body[1]}`}</Box>
    </SimpleTextBody>
  );

  const approveSpendingFooterText = useMemo(() => (rejectedSpending
    ? approveSpending.footer.retryText
    : approveSpending.footer.buttonText), [rejectedSpending]);

  const handleApproveSpendingClick = () => {
    try {
      setShowApproveSpendingStep(false);
    } catch (err: any) {
      setRejectedSpending(true);
    }
  };

  // Approve swap step
  const approveSwapContent = (
    <SimpleTextBody heading={approveSwap.content.heading}>
      <Box>{approveSwap.content.body}</Box>
    </SimpleTextBody>
  );

  const approveSwapFooterText = useMemo(() => (rejectedSwap
    ? approveSwap.footer.retryText
    : approveSwap.footer.buttonText), [approveSwap]);

  const handleApproveSwapClick = () => {
    try {
      console.log('swap');
    } catch (err: any) {
      setRejectedSwap(true);
    }
  };

  const handleClick = showApproveSpendingStep ? handleApproveSpendingClick : handleApproveSwapClick;

  return (
    <SimpleLayout
      header={<HeaderNavigation transparent showBack onCloseButtonClick={sendSwapWidgetCloseEvent} />}
      floatHeader
      heroContent={showApproveSpendingStep ? <IMXCoinsHero /> : <ImmutableNetworkHero />}
      footer={(
        <FooterButton
          actionText={showApproveSpendingStep ? approveSpendingFooterText : approveSwapFooterText}
          onActionClick={handleClick}
        />
      )}
    >
      {showApproveSpendingStep ? approveSpendContent : approveSwapContent}
    </SimpleLayout>
  );
}
