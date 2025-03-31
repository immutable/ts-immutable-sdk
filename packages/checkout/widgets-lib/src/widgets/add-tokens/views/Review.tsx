import { RouteResponse } from '@0xsquid/squid-types';
import {
  Body,
  ButtCon,
  Button,
  EllipsizedText,
  FramedIcon,
  FramedImage,
  Heading,
  hFlex,
  Icon,
  PriceDisplay,
  Stack,
  Sticker,
  useInterval,
} from '@biom3/react';
import { ChainId } from '@imtbl/checkout-sdk';
import { trackFlow } from '@imtbl/metrics';
import { t } from 'i18next';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import {
  AddTokensReviewData,
  AddTokensWidgetViews,
} from '../../../context/view-context/AddTokensViewContextTypes';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { SquidIcon } from '../../../lib/squid/components/SquidIcon';
import { useExecute } from '../../../lib/squid/hooks/useExecute';
import { useRoutes } from '../../../lib/squid/hooks/useRoutes';
import { AddTokensContext } from '../context/AddTokensContext';
import { AddTokensErrorTypes } from '../types';

import {
  useAnalytics,
  UserJourney,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';
import { getRouteChains } from '../../../lib/squid/functions/getRouteChains';
import { getTotalRouteFees } from '../../../lib/squid/functions/getTotalRouteFees';
import { LoadingView } from '../../../views/loading/LoadingView';

import { AddressMissmatchDrawer } from '../../../components/AddressMismatchDrawer/AddressMissmatchDrawer';
import { RouteFees } from '../../../components/RouteFees/RouteFees';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { convertToNetworkChangeableProvider } from '../../../functions/convertToNetworkChangeableProvider';
import { getDurationFormatted } from '../../../functions/getDurationFormatted';
import { getFormattedAmounts, getFormattedNumber } from '../../../functions/getFormattedNumber';
import { SquidFooter } from '../../../lib/squid/components/SquidFooter';
import {
  SQUID_NATIVE_TOKEN,
} from '../../../lib/squid/config';
import { verifyAndSwitchChain } from '../../../lib/squid/functions/verifyAndSwitchChain';
import { useError } from '../hooks/useError';
import { FromAmountData } from '../../../lib/squid/types';
import {
  sendAddTokensSuccessEvent,
} from '../AddTokensWidgetEvents';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { AddTokensHandoverStep, useHandoverConfig } from '../hooks/useHandoverConfig';

interface ReviewProps {
  data: AddTokensReviewData;
  showBackButton: boolean;
  onBackButtonClick?: () => void;
  onCloseButtonClick?: () => void;
}

const dividerSx = {
  content: "''",
  pos: 'absolute',
  left: 'base.spacing.x6',
  w: '1px',
  bg: 'base.color.translucent.standard.500',
};

export function Review({
  data,
  showBackButton = false,
  onBackButtonClick,
  onCloseButtonClick,
}: ReviewProps) {
  const { viewDispatch } = useContext(ViewContext);

  const { track, page } = useAnalytics();

  const {
    addTokensState: {
      id, squid, chains, tokens,
    },
  } = useContext(AddTokensContext);

  const {
    providersState: {
      checkout, fromProvider, fromAddress, toAddress, fromProviderInfo,
    },
  } = useProvidersContext();

  const { showErrorHandover } = useError(checkout.config.environment);

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const [route, setRoute] = useState<RouteResponse | undefined>();
  const [amountData, setAmountData] = useState<FromAmountData | undefined>();
  const [proceedDisabled, setProceedDisabled] = useState(true);
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);
  const [showSecuringQuote, setShowSecuringQuote] = useState(false);
  const [showAddressMissmatchDrawer, setShowAddressMissmatchDrawer] = useState(false);
  const { getFromAmountData, getRoute } = useRoutes();
  const { showHandover } = useHandoverConfig(checkout.config.environment);

  const { onTransactionError } = useErrorHandler();

  const {
    getAllowance, approve, execute, getStatus,
  } = useExecute(UserJourney.ADD_TOKENS, onTransactionError);

  useEffect(() => {
    page({
      userJourney: UserJourney.ADD_TOKENS,
      screen: 'Review',
      extras: {
        contextId: id,
        toAmount: data.toAmount,
        toChainId: data.toChainId,
        toTokenAddress: data.toTokenAddress,
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const getFromAmountAndRoute = async () => {
    if (!squid || !tokens) return;

    if (!fromAddress || !toAddress) return;

    setShowSecuringQuote(true);

    const updatedAmountData = getFromAmountData(
      tokens,
      data.balance,
      data.toAmount,
      data.toChainId,
      data.toTokenAddress === 'native'
        ? SQUID_NATIVE_TOKEN
        : data.toTokenAddress,
      data.additionalBuffer,
    );

    if (!updatedAmountData) return;

    const routeResponse = await getRoute(
      squid,
      updatedAmountData?.fromToken,
      updatedAmountData?.toToken,
      toAddress,
      updatedAmountData.fromAmount,
      updatedAmountData.toAmount,
      fromAddress,
      false,
    );
    setRoute(routeResponse.route);
    setAmountData(updatedAmountData);
    setProceedDisabled(false);
    setShowSecuringQuote(false);
    if (routeResponse?.route === undefined) {
      showErrorHandover(AddTokensErrorTypes.ROUTE_ERROR, {
        contextId: id,
        error: 'Failed to obtain final route',
      });
    }
  };

  const { fromChain, toChain } = useMemo(
    () => getRouteChains(chains, route),
    [chains, route],
  );

  const getRouteIntervalIdRef = useInterval(getFromAmountAndRoute, 20000);
  useEffect(() => {
    getFromAmountAndRoute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { totalFees, totalFeesUsd } = useMemo(
    () => getTotalRouteFees(route),
    [route],
  );

  const openFeeBreakdown = () => {
    const feesToken = route?.route.estimate.feeCosts?.[0]?.token;
    track({
      userJourney: UserJourney.ADD_TOKENS,
      screen: 'Review',
      control: 'FeeBreakdown',
      controlType: 'Button',
      extras: {
        contextId: id,
        feesToken: feesToken?.symbol,
        totalAmount: feesToken ? getFormattedNumber(totalFees, feesToken.decimals) : null,
        totalFiatAmount: getFormattedAmounts(totalFeesUsd),
      },
    });

    setShowFeeBreakdown(true);
  };

  const routeFees = useMemo(() => {
    if (totalFeesUsd) {
      return (
        <Body
          onClick={() => openFeeBreakdown()}
          size="small"
          sx={{
            ...hFlex,
            alignItems: 'center',
            c: 'base.color.text.body.secondary',
            cursor: 'pointer',
          }}
        >
          {t('views.ADD_TOKENS.fees.includedFees')}
          {` ${t(
            'views.ADD_TOKENS.fees.fiatPricePrefix',
          )} $${getFormattedAmounts(totalFeesUsd)}`}
          <Icon
            icon="ChevronExpand"
            sx={{ ml: 'base.spacing.x2', w: 'base.icon.size.200' }}
          />
        </Body>
      );
    }

    return (
      <Body
        size="small"
        sx={{
          ...hFlex,
          alignItems: 'center',
          c: 'base.color.text.body.secondary',
        }}
      >
        {t('views.ADD_TOKENS.fees.zeroFees')}
      </Body>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalFeesUsd]);

  const formattedDuration = route
    ? getDurationFormatted(
      route.route.estimate.estimatedRouteDuration,
      t('views.ADD_TOKENS.routeSelection.minutesText'),
      t('views.ADD_TOKENS.routeSelection.minuteText'),
      t('views.ADD_TOKENS.routeSelection.secondsText'),
    )
    : '';

  const handleTransaction = useCallback(async () => {
    if (!squid || !fromProvider || !route || !fromProviderInfo) {
      return;
    }

    let currentFromAddress = '';
    track({
      userJourney: UserJourney.ADD_TOKENS,
      screen: 'Review',
      control: 'Proceed',
      controlType: 'Button',
      extras: {
        contextId: id,
        toTokenAddress: route.route.params.toToken,
        toTokenChainId: route.route.params.toChain,
        fromTokenAddress: route.route.params.fromToken,
        fromTokenChainId: route.route.params.fromChain,
        fromAddress: route.route.params.fromAddress,
        toAddress: route.route.params.toAddress,
        estimatedRouteDuration: route.route.estimate.estimatedRouteDuration,
        fromAmount: amountData?.fromAmount,
        toAmount: amountData?.toAmount,
      },
    });

    try {
      currentFromAddress = await (await fromProvider.getSigner()).getAddress();
    } catch (error) {
      showErrorHandover(AddTokensErrorTypes.PROVIDER_ERROR, {
        contextId: id,
        error,
      });
      return;
    }

    if (currentFromAddress !== fromAddress) {
      setShowAddressMissmatchDrawer(true);
      return;
    }

    clearInterval(getRouteIntervalIdRef.current);
    setProceedDisabled(true);

    showHandover(AddTokensHandoverStep.PREPARING, {});

    const changeableProvider = await convertToNetworkChangeableProvider(
      fromProvider,
    );
    const verifyChainResult = await verifyAndSwitchChain(
      changeableProvider,
      route.route.params.fromChain,
    );

    if (!verifyChainResult.isChainCorrect) {
      return;
    }

    const allowance = await getAllowance(changeableProvider, route);
    const { fromAmount } = route.route.params;

    if (allowance && allowance < BigInt(fromAmount)) {
      showHandover(AddTokensHandoverStep.REQUEST_APPROVAL, {});

      const approveTxnReceipt = await approve(fromProviderInfo, changeableProvider, route);
      if (!approveTxnReceipt) {
        return;
      }

      showHandover(AddTokensHandoverStep.APPROVAL_CONFIRMED, {});
    }

    showHandover(AddTokensHandoverStep.REQUEST_EXECUTION, {});

    const executeTxnReceipt = await execute(squid, fromProviderInfo, changeableProvider, route);

    if (executeTxnReceipt) {
      track({
        userJourney: UserJourney.ADD_TOKENS,
        screen: 'FundsAdded',
        action: 'Succeeded',
        extras: {
          contextId: id,
          ...(route.route.params.fromChain !== ChainId.IMTBL_ZKEVM_MAINNET.toString()
            && { txHash: executeTxnReceipt.hash }),
          ...(route.route.params.fromChain === ChainId.IMTBL_ZKEVM_MAINNET.toString()
            && { immutableZkEVMTxHash: executeTxnReceipt.hash }),
          toTokenAddress: route.route.params.toToken,
          toTokenChainId: route.route.params.toChain,
          fromTokenAddress: route.route.params.fromToken,
          fromTokenChainId: route.route.params.fromChain,
          fromAmount: amountData?.fromAmount,
          fromAddress: route.route.params.fromAddress,
          toAddress: route.route.params.toAddress,
          toAmount: amountData?.toAmount,
          fromTokenSymbol: amountData?.fromToken.symbol,
          toTokenSymbol: amountData?.toToken.symbol,
        },
      }).then((ctx) => {
        trackFlow('commerce', `addTokensFundsAdded_${ctx.event.messageId}`);
      });

      sendAddTokensSuccessEvent(eventTarget, executeTxnReceipt.hash);

      if (toChain === fromChain) {
        showHandover(AddTokensHandoverStep.SUCCESS_ZKEVM, { transactionHash: executeTxnReceipt.hash });
        return;
      }

      showHandover(AddTokensHandoverStep.EXECUTING, {
        routeDuration: formattedDuration,
        transactionHash: executeTxnReceipt.hash,
      });

      const status = await getStatus(squid, executeTxnReceipt.hash);
      const axelarscanUrl = `https://axelarscan.io/gmp/${executeTxnReceipt?.hash}`;

      if (status?.squidTransactionStatus === 'success') {
        showHandover(AddTokensHandoverStep.SUCCESS, { axelarscanUrl });
      } else if (status?.squidTransactionStatus === 'needs_gas') {
        showHandover(AddTokensHandoverStep.NEEDS_GAS, { axelarscanUrl });
      } else if (status?.squidTransactionStatus === 'partial_success') {
        showHandover(AddTokensHandoverStep.PARTIAL_SUCCESS, { axelarscanUrl });
      } else {
        showHandover(AddTokensHandoverStep.FAIL, { axelarscanUrl });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    route,
    squid,
    fromProvider,
    getRouteIntervalIdRef,
    approve,
    showHandover,
    getAllowance,
    execute,
    viewDispatch,
  ]);

  return (
    <SimpleLayout
      containerSx={{ bg: 'transparent' }}
      header={(
        <Stack
          rc={<header />}
          direction="row"
          sx={{
            pt: 'base.spacing.x4',
            px: 'base.spacing.x5',
            h: 'base.spacing.x18',
            w: '100%',
          }}
          justifyContent="flex-start"
        >
          {showBackButton && (
            <ButtCon
              testId="backButton"
              icon="ArrowBackward"
              variant="tertiary"
              size="small"
              onClick={onBackButtonClick}
            />
          )}
          <ButtCon
            variant="tertiary"
            size="small"
            icon="Close"
            onClick={onCloseButtonClick}
            sx={{ ml: 'auto' }}
          />
        </Stack>
      )}
    >
      <Stack
        sx={{
          w: '100%',
          flex: 1,
          overflowY: 'auto',
        }}
        alignItems="stretch"
        gap="base.spacing.x4"
        testId="reviewContainer"
      >
        {!!route && (
          <>
            <Heading weight="bold" sx={{ textAlign: 'center' }}>
              {t('views.ADD_TOKENS.review.heading')}
            </Heading>

            <Stack gap="0px">
              <Stack
                direction="row"
                sx={{ py: 'base.spacing.x5', px: 'base.spacing.x7' }}
                gap="base.spacing.x6"
                alignItems="center"
              >
                <Sticker position={{ x: 'right', y: 'bottom' }}>
                  <FramedImage
                    use={(
                      <img
                        src={route.route.estimate.fromToken.logoURI}
                        alt={route.route.estimate.fromToken.name}
                      />
                    )}
                    circularFrame
                    size="large"
                  />
                  <Sticker.FramedImage
                    use={<img src={fromChain?.iconUrl} alt={fromChain?.name} />}
                    emphasized
                  />
                </Sticker>
                <Stack sx={{ flex: 1 }} gap="0px">
                  <Body weight="bold">
                    {t('views.ADD_TOKENS.review.send')}
                    {' '}
                    {route.route.estimate.fromToken.symbol}
                  </Body>
                  <Body
                    size="small"
                    sx={{ c: 'base.color.text.body.secondary' }}
                  >
                    {fromChain?.name}
                    <EllipsizedText
                      text={fromAddress ?? ''}
                      sx={{
                        d: 'block',
                        fontSize: 'inherit',
                        lineHeight: 'inherit',
                        c: 'inherit',
                      }}
                    />
                  </Body>
                </Stack>
                <PriceDisplay
                  price={getFormattedNumber(
                    route.route.estimate.fromAmount,
                    route.route.estimate.fromToken.decimals,
                  )}
                  sx={{ flexShrink: 0, alignSelf: 'flex-start' }}
                >
                  <PriceDisplay.Caption size="small">
                    {`${t('views.ADD_TOKENS.fees.fiatPricePrefix')} $${
                      getFormattedAmounts(route?.route.estimate.fromAmountUSD ?? '')
                    }`}
                  </PriceDisplay.Caption>
                </PriceDisplay>
              </Stack>
              {/*

          */}
              <Stack
                sx={{
                  pos: 'relative',
                  w: 'base.spacing.x16',
                  ml: 'base.spacing.x7',

                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  '&::before': {
                    ...dividerSx,
                    top: '-14px',
                    h: 'base.spacing.x10',
                  },
                }}
              />
              {/*

          */}
              <Stack
                direction="row"
                sx={{ py: 'base.spacing.x5', px: 'base.spacing.x7' }}
                gap="base.spacing.x6"
                alignItems="center"
              >
                <Stack
                  direction="row"
                  sx={{ w: 'base.spacing.x12' }}
                  justifyContent="center"
                >
                  <FramedImage use={<SquidIcon />} size="medium" padded />
                </Stack>
                <Stack sx={{ flex: 1 }} gap="0px">
                  <Body weight="bold">
                    {t('views.ADD_TOKENS.review.swap')}
                    {' '}
                    {route.route.estimate.fromToken.symbol}
                    {' '}
                    {t('views.ADD_TOKENS.review.to')}
                    {' '}
                    {route.route.estimate.toToken.symbol}
                  </Body>
                  <Body
                    size="small"
                    sx={{ c: 'base.color.text.body.secondary' }}
                  >
                    {t('views.ADD_TOKENS.review.poweredBySquid')}
                    <br />
                    1
                    {route.route.estimate.fromToken.symbol}
                    {' '}
                    =
                    {' '}
                    {getFormattedAmounts(
                      route.route.estimate.exchangeRate,
                    )}
                    {' '}
                    {route.route.estimate.toToken.symbol}
                  </Body>
                </Stack>
              </Stack>
              {/*

            */}
              <Stack
                sx={{
                  pos: 'relative',
                  w: 'base.spacing.x16',
                  ml: 'base.spacing.x7',

                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  '&::before': {
                    ...dividerSx,
                    top: '-26px',
                    h: 'base.spacing.x10',
                  },
                }}
              />
              {/*

          */}
              <Stack
                direction="row"
                sx={{ py: 'base.spacing.x5', px: 'base.spacing.x7' }}
                gap="base.spacing.x6"
                alignItems="center"
              >
                <Sticker position={{ x: 'right', y: 'bottom' }}>
                  <FramedImage
                    use={(
                      <img
                        src={route.route.estimate.toToken.logoURI}
                        alt={route.route.estimate.toToken.name}
                      />
                    )}
                    circularFrame
                    size="large"
                  />
                  <Sticker.FramedImage
                    use={<img src={toChain?.iconUrl} alt={toChain?.name} />}
                    emphasized
                  />
                </Sticker>
                <Stack sx={{ flex: 1 }} gap="0px">
                  <Body weight="bold">
                    {t('views.ADD_TOKENS.review.receive')}
                    {' '}
                    {route?.route.estimate.toToken.symbol}
                  </Body>
                  <Body
                    size="small"
                    sx={{ c: 'base.color.text.body.secondary' }}
                  >
                    {toChain?.name}
                    <EllipsizedText
                      text={toAddress ?? ''}
                      sx={{
                        d: 'block',
                        fontSize: 'inherit',
                        lineHeight: 'inherit',
                        c: 'inherit',
                      }}
                    />
                  </Body>
                </Stack>
                <PriceDisplay
                  price={getFormattedNumber(
                    route?.route.estimate.toAmount,
                    route?.route.estimate.toToken.decimals,
                  )}
                  sx={{ flexShrink: 0, alignSelf: 'flex-start' }}
                >
                  <PriceDisplay.Caption size="small">
                    {`${t('views.ADD_TOKENS.fees.fiatPricePrefix')} $${
                      getFormattedAmounts(route?.route.estimate.toAmountUSD ?? '')
                    }`}
                  </PriceDisplay.Caption>
                </PriceDisplay>
              </Stack>
              {/*

            */}
              <Stack
                sx={{
                  pos: 'relative',
                  w: 'base.spacing.x16',
                  ml: 'base.spacing.x7',

                  // eslint-disable-next-line @typescript-eslint/naming-convention
                  '&::before': {
                    ...dividerSx,
                    top: '-8px',
                    h: 'base.spacing.x5',
                  },
                }}
              />
              {/*

            */}
              <Stack
                direction="row"
                gap="base.spacing.x6"
                sx={{ py: 'base.spacing.x5', px: 'base.spacing.x7' }}
                alignItems="center"
              >
                <Stack
                  direction="row"
                  sx={{ w: 'base.spacing.x12' }}
                  justifyContent="center"
                >
                  <FramedIcon
                    icon="Countdown"
                    variant="bold"
                    size="medium"
                    circularFrame
                  />
                </Stack>
                <Body
                  size="small"
                  sx={{ flex: 1, c: 'base.color.text.body.secondary' }}
                >
                  {formattedDuration}
                </Body>
                {routeFees}
              </Stack>
            </Stack>

            <Button
              size="large"
              onClick={handleTransaction}
              disabled={proceedDisabled}
              sx={{ mx: 'base.spacing.x3' }}
            >
              {proceedDisabled
                ? t('views.ADD_TOKENS.review.processingButtonText')
                : t('views.ADD_TOKENS.review.proceedButtonText')}
            </Button>

            <SquidFooter />
          </>
        )}

        {!route && !showAddressMissmatchDrawer && showSecuringQuote && (
          <LoadingView
            loadingText={t('views.ADD_TOKENS.review.loadingText')}
            containerSx={{ bg: 'transparent' }}
          />
        )}
      </Stack>
      <RouteFees
        routeData={route}
        visible={showFeeBreakdown}
        onClose={() => setShowFeeBreakdown(false)}
        totalAmount={totalFees}
        totalFiatAmount={totalFeesUsd}
      />
      <AddressMissmatchDrawer
        visible={showAddressMissmatchDrawer}
        onClick={() => {
          setShowAddressMissmatchDrawer(false);

          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: AddTokensWidgetViews.ADD_TOKENS,
              },
            },
          });
        }}
      />
    </SimpleLayout>
  );
}
