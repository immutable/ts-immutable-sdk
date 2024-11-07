import { Box, Button, EllipsizedText } from '@biom3/react';
import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ChainId, WalletProviderName } from '@imtbl/checkout-sdk';
import { FlowRateWithdrawResponse } from '@imtbl/bridge-sdk';
import { UserJourney, useAnalytics } from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { Transaction } from '../../../lib/clients';
import { getChainNameById } from '../../../lib/chains';
import { WITHDRAWAL_CLAIM_GAS_LIMIT, getL1ChainId } from '../../../lib';
import { isPassportProvider } from '../../../lib/provider';
import { isNativeToken } from '../../../lib/utils';
import { NotEnoughEthToWithdraw } from '../../../components/Transactions/NotEnoughEthToWithdraw';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { BridgeContext } from '../context/BridgeContext';
import { WalletApproveHero } from '../../../components/Hero/WalletApproveHero';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { FeeData } from 'ethers';

export interface ClaimWithdrawalProps {
  transaction: Transaction,
}
export function ClaimWithdrawal({ transaction }: ClaimWithdrawalProps) {
  const { t } = useTranslation();
  const { bridgeState: { checkout, tokenBridge, from } } = useContext(BridgeContext);
  const { viewDispatch } = useContext(ViewContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { page } = useAnalytics();

  useEffect(() => {
    page({
      userJourney: UserJourney.BRIDGE,
      screen: 'ClaimWithdrawal',
    });
  }, []);

  const [txProcessing, setTxProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasWithdrawError, setHasWithdrawError] = useState(false);
  const [withdrawalResponse, setWithdrawalResponse] = useState<FlowRateWithdrawResponse | null>();
  const [showNotEnoughEthDrawer, setShowNotEnoughEthDrawer] = useState(false);

  const goBack = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.GO_BACK,
      },
    });
  }, [viewDispatch]);

  /**
    * This effect should load the transaction that should be ready to be withdrawn.
    * There should be a receiver -> details.to_address AND
    * there should be an index ->  details.current_status.index
    */
  useEffect(() => {
    const getWithdrawalTxn = async () => {
      if (!tokenBridge || !transaction || transaction.details.current_status?.index === undefined) return;
      // get withdrawal transaction from the token bridge by receipient address and index
      setLoading(true);
      try {
        const flowRateWithdrawTxnResponse = await tokenBridge?.getFlowRateWithdrawTx({
          recipient: transaction.details.to_address,
          index: transaction.details.current_status.index!,
        });
        setWithdrawalResponse(flowRateWithdrawTxnResponse);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    getWithdrawalTxn();
  }, [tokenBridge, transaction]);

  const handleWithdrawalClaimClick = useCallback(async ({ forceChangeAccount }: { forceChangeAccount: boolean }) => {
    if (!checkout || !tokenBridge || !from?.web3Provider || !withdrawalResponse) return;

    if (!withdrawalResponse.pendingWithdrawal.canWithdraw || !withdrawalResponse.unsignedTx) {
      // eslint-disable-next-line max-len, no-console
      console.log(`Unable to process withdrawal transaction as it is not ready yet. Delay timeout at ${withdrawalResponse.pendingWithdrawal.timeoutEnd} `);
      return;
    }

    let providerToUse = from?.web3Provider;
    const l1ChainId = getL1ChainId(checkout.config);

    setTxProcessing(true);

    if (isPassportProvider(from?.web3Provider) || forceChangeAccount) {
      // user should switch to MetaMask
      try {
        const createProviderResult = await checkout.createProvider({ walletProviderName: WalletProviderName.METAMASK });
        const connectResult = await checkout.connect({
          provider: createProviderResult.provider,
          requestWalletPermissions: true,
        });
        providerToUse = connectResult.provider;
        setShowNotEnoughEthDrawer(false);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
        setHasWithdrawError(true);
        setTxProcessing(false);
        return;
      }
    }

    /**
     * Gas fee estimation and balance checks are done on a best effort basis.
     * If for some reason the balance calls fail or gas fee data calls fail
     * don't block the transaction from being submitted.
     */

    let gasEstimate: bigint;
    let ethGasCostWei: bigint | null = null;
    try {
      try {
        gasEstimate = await providerToUse.estimateGas(withdrawalResponse.unsignedTx);
      } catch (err) {
        gasEstimate = BigInt(WITHDRAWAL_CLAIM_GAS_LIMIT);
      }

      let feeData: FeeData | null = null;
      try {
        feeData = await providerToUse.getFeeData();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }

      let gasPriceInWei: bigint | null = null;
      if (feeData && feeData.lastBaseFeePerGas && feeData.maxPriorityFeePerGas) {
        gasPriceInWei = feeData.lastBaseFeePerGas.add(feeData.maxPriorityFeePerGas);
      } else if (feeData && feeData.gasPrice) {
        gasPriceInWei = feeData.gasPrice;
      }
      if (gasPriceInWei) {
        ethGasCostWei = gasEstimate * gasPriceInWei;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }

    // get L1 balances and do check for enough ETH to cover gas
    try {
      const balancesResult = await checkout.getAllBalances({
        provider: providerToUse,
        chainId: l1ChainId,
      });

      const ethBalance = balancesResult.balances.find((balance) => isNativeToken(balance.token.address));

      if (!ethBalance || (ethBalance.balance < ethGasCostWei!)) {
        setShowNotEnoughEthDrawer(true);
        setTxProcessing(false);
        return;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }

    // check that provider is connected to L1
    const network = await providerToUse.getNetwork();

    if (network.chainId as unknown as ChainId !== l1ChainId) {
      try {
        const switchNetworkResult = await checkout.switchNetwork({
          provider: providerToUse,
          chainId: l1ChainId,
        });
        providerToUse = switchNetworkResult.provider;
      } catch (err) {
        setHasWithdrawError(true);
        setLoading(false);
        // eslint-disable-next-line no-console
        console.log(err);
        return;
      }
    }

    // send transaction to wallet for signing
    try {
      const response = await checkout.sendTransaction({
        provider: providerToUse,
        transaction: withdrawalResponse.unsignedTx,
      });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: BridgeWidgetViews.CLAIM_WITHDRAWAL_IN_PROGRESS,
            transactionResponse: response.transactionResponse,
          },
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      setHasWithdrawError(true);
      setTxProcessing(false);
    } finally {
      setTxProcessing(false);
    }
  }, [tokenBridge, from, withdrawalResponse]);

  return (
    <SimpleLayout
      testId="claim-withdrawal"
      header={(
        <HeaderNavigation
          transparent
          showBack
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
          onBackButtonClick={goBack}
        />
      )}
      floatHeader
      heroContent={<WalletApproveHero />}
      footer={(
        <Box sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        >
          <Box sx={{
            pb: 'base.spacing.x5',
            px: 'base.spacing.x6',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
          >
            <Button
              testId="claim-withdrawal-continue-button"
              size="large"
              variant="primary"
              disabled={loading}
              onClick={() => ((txProcessing || loading)
                ? undefined
                : handleWithdrawalClaimClick({ forceChangeAccount: true }))}
            >
              {loading || txProcessing ? (
                <Button.Icon icon="Loading" sx={{ width: 'base.icon.size.400' }} />
              ) : t(`views.CLAIM_WITHDRAWAL.${hasWithdrawError ? 'footer.retryText' : 'footer.buttonText'}`)}
            </Button>
          </Box>
          <FooterLogo />
        </Box>
      )}
    >
      <SimpleTextBody
        heading={
          `${t('views.CLAIM_WITHDRAWAL.content.heading')} ${getChainNameById(getL1ChainId(checkout.config))}`
        }
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', pb: 'base.spacing.x1' }}>
          {t('views.CLAIM_WITHDRAWAL.content.body')}
        </Box>
        <Box>
          {t('views.CLAIM_WITHDRAWAL.content.body2')}
          <EllipsizedText text={transaction.details.to_address.toLowerCase() ?? ''} />
        </Box>
      </SimpleTextBody>
      <NotEnoughEthToWithdraw
        visible={showNotEnoughEthDrawer}
        onClose={() => setShowNotEnoughEthDrawer(false)}
        onChangeAccount={() => handleWithdrawalClaimClick({ forceChangeAccount: true })}
      />
    </SimpleLayout>
  );
}
