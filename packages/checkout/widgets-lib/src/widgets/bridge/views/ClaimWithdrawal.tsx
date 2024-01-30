import { Box, Button, EllipsizedText } from '@biom3/react';
import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { useTranslation } from 'react-i18next';
import { Transaction } from 'lib/clients';
import { getChainNameById } from 'lib/chains';
import { getL1ChainId } from 'lib';
import { isPassportProvider } from 'lib/providerUtils';
import { TransactionRequest } from '@ethersproject/providers';
import { WalletProviderName } from '@imtbl/checkout-sdk';
import { isNativeToken } from 'lib/utils';
import { BigNumber } from 'ethers';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { BridgeContext } from '../context/BridgeContext';
import { WalletApproveHero } from '../../../components/Hero/WalletApproveHero';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { FooterLogo } from '../../../components/Footer/FooterLogo';

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
      screen: 'ApproveTransaction',
    });
  }, []);

  const [txProcessing, setTxProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasWithdrawError, setHasWithdrawError] = useState(false);
  const [withdrawalTxn, setWithdrawalTxn] = useState<TransactionRequest | null>();

  const goBack = useCallback(() => {
    viewDispatch({
      payload: {
        type: ViewActions.GO_BACK,
      },
    });
  }, [viewDispatch]);

  useEffect(() => {
    const getWithdrawalTxn = async () => {
      if (!tokenBridge) return;
      // get withdrawal transaction from the token bridge by receipient address and index
      setLoading(true);
      try {
        const flowRateWithdrawTxnResponse = await tokenBridge?.getFlowRateWithdrawTx({
          recipient: transaction.details.to_address,
          index: 0, // TODO: update index from transaction when it comes through from backend
        });
        setWithdrawalTxn(flowRateWithdrawTxnResponse.unsignedTx);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    getWithdrawalTxn();
  }, [tokenBridge]);

  const handleWithdrawalClaimClick = useCallback(async () => {
    if (!checkout || !tokenBridge || !from?.web3Provider || !withdrawalTxn) return;

    let providerToUse = from?.web3Provider;
    const l1ChainId = getL1ChainId(checkout.config);

    setTxProcessing(true);

    if (isPassportProvider(from?.web3Provider)) {
      // user should switch to MetaMask
      try {
        const createProviderResult = await checkout.createProvider({ walletProviderName: WalletProviderName.METAMASK });
        const connectResult = await checkout.connect({
          provider: createProviderResult.provider,
          requestWalletPermissions: true,
        });
        providerToUse = connectResult.provider;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
        return;
      }
    }

    let ethGasCostWei: BigNumber | null;
    try {
      const gasEstimate = await providerToUse.estimateGas(withdrawalTxn);
      const feeData = await providerToUse.getFeeData();
      let gasPriceInWei: BigNumber | null;
      if (feeData.lastBaseFeePerGas && feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        gasPriceInWei = feeData.lastBaseFeePerGas.add(feeData.maxPriorityFeePerGas);
      } else {
        gasPriceInWei = feeData.gasPrice;
      }
      if (!gasPriceInWei) throw new Error('unable to fetch gas price');
      ethGasCostWei = gasEstimate.mul(gasPriceInWei);
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

      if (!ethBalance || ethBalance.balance.lt(ethGasCostWei!)) {
        // TODO: if eth balance is less than the total gas cost required for the txn then pop up Not enough ETH drawer
        // eslint-disable-next-line no-console
        console.log('not enough eth to pay for claim withdrawal txn');
        setLoading(false);
        return;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      setHasWithdrawError(true);
      setLoading(false);
      return;
    }

    // check that provider is connected to L1
    const network = await providerToUse.getNetwork();

    if (network.chainId !== l1ChainId) {
      try {
        const switchNetworkResult = await checkout.switchNetwork({
          provider: providerToUse,
          chainId: l1ChainId,
        });
        providerToUse = switchNetworkResult.provider;
      } catch (err) {
        setHasWithdrawError(true);
        // eslint-disable-next-line no-console
        console.log(err);
        return;
      }
    }

    // send transaction to wallet for signing
    try {
      // TODO: WT-2054 Update view to go to in progress screens and pass through sendTransaction response

      // const response = await checkout.sendTransaction({
      //   provider: providerToUse,
      //   transaction: withdrawalTxn,
      // });

    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      setHasWithdrawError(true);
      setTxProcessing(false);
    } finally {
      setTxProcessing(false);
    }
  }, [tokenBridge, from, withdrawalTxn]);

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
              onClick={(txProcessing || loading) ? () => { } : handleWithdrawalClaimClick}
            >
              {loading ? (
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
    </SimpleLayout>
  );
}
