import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  Link,
  PriceDisplay,
  Stack,
  Sticker,
  useInterval,
} from '@biom3/react';
import { RouteResponse } from '@0xsquid/squid-types';
import { t } from 'i18next';
import { Environment } from '@imtbl/config';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { AddTokensContext } from '../context/AddTokensContext';
import { useRoutes } from '../hooks/useRoutes';
import {
  AddTokensReviewData,
  AddTokensWidgetViews,
} from '../../../context/view-context/AddTokensViewContextTypes';
import { AddTokensErrorTypes, RiveStateMachineInput } from '../types';
import { useExecute } from '../hooks/useExecute';
import {
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { SquidIcon } from '../components/SquidIcon';
import { useHandover } from '../../../lib/hooks/useHandover';
import { HandoverTarget } from '../../../context/handover-context/HandoverContext';
import { HandoverContent } from '../../../components/Handover/HandoverContent';
import { getRemoteRive } from '../../../lib/utils';
import {
  APPROVE_TXN_ANIMATION,
  EXECUTE_TXN_ANIMATION,
  FIXED_HANDOVER_DURATION,
  SQUID_NATIVE_TOKEN,
} from '../utils/config';
import {
  useAnalytics,
  UserJourney,
} from '../../../context/analytics-provider/SegmentAnalyticsProvider';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';
import { LoadingView } from '../../../views/loading/LoadingView';
import { getDurationFormatted } from '../functions/getDurationFormatted';
import { RouteFees } from '../components/RouteFees';
import { AddressMissmatchDrawer } from '../components/AddressMissmatchDrawer';
import { getTotalRouteFees } from '../functions/getTotalRouteFees';
import { getRouteChains } from '../functions/getRouteChains';
import {
  getFormattedAmounts,
  getFormattedNumber,
  getFormattedNumberWithDecimalPlaces,
} from '../functions/getFormattedNumber';
import { convertToNetworkChangeableProvider } from '../functions/convertToNetworkChangeableProvider';
import { SquidFooter } from '../components/SquidFooter';
import { useError } from '../hooks/useError';

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
    addTokensState: { squid, chains, tokens },
  } = useContext(AddTokensContext);

  const {
    providersState: {
      checkout, fromProvider, fromAddress, toAddress,
    },
  } = useProvidersContext();

  const [route, setRoute] = useState<RouteResponse | undefined>();
  const [proceedDisabled, setProceedDisabled] = useState(true);
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);
  const [showAddressMissmatchDrawer, setShowAddressMissmatchDrawer] = useState(false);
  const { getAmountData, getRoute } = useRoutes();
  const { addHandover, closeHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });

  const { showErrorHandover } = useError(checkout.config.environment);

  const {
    checkProviderChain,
    getAllowance,
    approve,
    execute,
  } = useExecute(checkout?.config.environment || Environment.SANDBOX);

  useEffect(() => {
    page({
      userJourney: UserJourney.ADD_TOKENS,
      screen: 'Review',
      extras: {
        toAmount: data.toAmount,
        toChainId: data.toChainId,
        toTokenAddress: data.toTokenAddress,
      },
    });
  }, []);

  const getFromAmountAndRoute = async () => {
    if (!squid || !tokens) return;

    if (!fromAddress || !toAddress) return;

    const amountData = getAmountData(
      tokens,
      data.balance,
      data.toAmount,
      data.toChainId,
      data.toTokenAddress === 'native'
        ? SQUID_NATIVE_TOKEN
        : data.toTokenAddress,
      data.additionalBuffer,
    );
    if (!amountData) return;

    const routeResponse = await getRoute(
      squid,
      amountData?.fromToken,
      amountData?.toToken,
      toAddress,
      amountData.fromAmount,
      amountData.toAmount,
      fromAddress,
      false,
    );
    setRoute(routeResponse.route);
    setProceedDisabled(false);
  };

  const { fromChain, toChain } = useMemo(
    () => getRouteChains(chains, route),
    [chains, route],
  );

  const getRouteIntervalIdRef = useInterval(getFromAmountAndRoute, 20000);
  useEffect(() => {
    getFromAmountAndRoute();
  }, []);

  const { totalFees, totalFeesUsd } = useMemo(
    () => getTotalRouteFees(route),
    [route],
  );
  const routeFees = useMemo(() => {
    if (totalFeesUsd) {
      return (
        <Body
          onClick={() => setShowFeeBreakdown(true)}
          size="small"
          sx={{
            ...hFlex,
            alignItems: 'center',
            c: 'base.color.text.body.secondary',
            cursor: 'pointer',
          }}
        >
          Included fees
          {` USD $${getFormattedAmounts(totalFeesUsd)}`}
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
        {t('Zero fees')}
      </Body>
    );
  }, [totalFeesUsd]);

  const showHandover = useCallback(
    (
      animationPath: string,
      state: RiveStateMachineInput,
      headingText: string,
      subheadingText?: ReactNode,
      duration?: number,
    ) => {
      addHandover({
        animationUrl: getRemoteRive(
          checkout?.config.environment,
          animationPath,
        ),
        inputValue: state,
        duration,
        children: (
          <HandoverContent
            headingText={headingText}
            subheadingText={subheadingText}
          />
        ),
      });
    },
    [addHandover, checkout],
  );

  const handleTransaction = useCallback(async () => {
    if (!squid || !fromProvider || !route) {
      return;
    }

    let currentFromAddress = '';

    try {
      currentFromAddress = await fromProvider.getSigner().getAddress();
    } catch (error) {
      showErrorHandover(AddTokensErrorTypes.PROVIDER_ERROR, { error });
      return;
    }

    if (currentFromAddress !== fromAddress) {
      setShowAddressMissmatchDrawer(true);
      return;
    }

    clearInterval(getRouteIntervalIdRef.current);
    setProceedDisabled(true);

    showHandover(
      APPROVE_TXN_ANIMATION,
      RiveStateMachineInput.START,
      'Preparing',
    );

    const changeableProvider = await convertToNetworkChangeableProvider(
      fromProvider,
    );

    const isValidNetwork = await checkProviderChain(
      changeableProvider,
      route.route.params.fromChain,
    );

    if (!isValidNetwork) {
      return;
    }

    const allowance = await getAllowance(changeableProvider, route);

    const { fromAmount } = route.route.params;
    if (allowance?.lt(fromAmount)) {
      showHandover(
        APPROVE_TXN_ANIMATION,
        RiveStateMachineInput.WAITING,
        'Waiting for access approval in your wallet',
        'Approve the transaction request to complete this transaction',
      );

      const approveTxnReceipt = await approve(changeableProvider, route);

      if (!approveTxnReceipt) {
        return;
      }

      showHandover(
        APPROVE_TXN_ANIMATION,
        RiveStateMachineInput.COMPLETED,
        'Granted access to your tokens',
        '',
        FIXED_HANDOVER_DURATION,
      );
    }

    showHandover(
      EXECUTE_TXN_ANIMATION,
      RiveStateMachineInput.WAITING,
      'Waiting for transaction confirmation in your wallet',
      'Confirm the transaction request to complete this transaction',
    );

    const executeTxnReceipt = await execute(squid, changeableProvider, route);

    if (executeTxnReceipt) {
      track({
        userJourney: UserJourney.ADD_TOKENS,
        screen: 'FundsAdded',
        action: 'Succeeded',
        extras: {
          txHash: executeTxnReceipt.transactionHash,
        },
      });

      showHandover(
        EXECUTE_TXN_ANIMATION,
        RiveStateMachineInput.PROCESSING,
        'Processing',
        '',
        FIXED_HANDOVER_DURATION,
      );

      showHandover(
        EXECUTE_TXN_ANIMATION,
        RiveStateMachineInput.COMPLETED,
        'Funds added successfully',
        <>
          Go to
          {' '}
          <Link
            size="small"
            rc={(
              <a
                target="_blank"
                href={`https://axelarscan.io/gmp/${executeTxnReceipt?.transactionHash}`}
                rel="noreferrer"
              />
            )}
          >
            Axelarscan
          </Link>
          {' '}
          for transaction details
        </>,
      );
    }
  }, [
    route,
    squid,
    fromProvider,
    getRouteIntervalIdRef,
    approve,
    showHandover,
    checkProviderChain,
    getAllowance,
    execute,
    closeHandover,
    viewDispatch,
  ]);

  const formattedDuration = route
    ? getDurationFormatted(route.route.estimate.estimatedRouteDuration)
    : '';

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
              Review
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
                    sx={{
                      bottom: 'base.spacing.x2',
                      right: 'base.spacing.x2',
                    }}
                  />
                </Sticker>
                <Stack sx={{ flex: 1 }} gap="0px">
                  <Body weight="bold">
                    Send
                    {' '}
                    {route.route.estimate.fromToken.name}
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
                    {`USD $${route?.route.estimate.fromAmountUSD ?? ''}`}
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
                    Swap
                    {' '}
                    {route.route.estimate.fromToken.name}
                    {' '}
                    to
                    {' '}
                    {route.route.estimate.toToken.name}
                  </Body>
                  <Body
                    size="small"
                    sx={{ c: 'base.color.text.body.secondary' }}
                  >
                    Powered by Squid
                    <br />
                    1
                    {' '}
                    {route.route.estimate.fromToken.symbol}
                    {' '}
                    =
                    {' '}
                    {getFormattedNumberWithDecimalPlaces(route.route.estimate.exchangeRate)}
                    {' '}
                    {route.route.estimate.toToken.name}
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
                        src={toChain?.nativeCurrency.iconUrl}
                        alt={toChain?.nativeCurrency.name}
                      />
                    )}
                    circularFrame
                    size="large"
                  />
                  <Sticker.FramedImage
                    use={<img src={toChain?.iconUrl} alt={toChain?.name} />}
                    emphasized
                    sx={{
                      bottom: 'base.spacing.x2',
                      right: 'base.spacing.x2',
                    }}
                  />
                </Sticker>
                <Stack sx={{ flex: 1 }} gap="0px">
                  <Body weight="bold">
                    Receive
                    {' '}
                    {route?.route.estimate.toToken.name}
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
                    {`USD $${route?.route.estimate.toAmountUSD ?? ''}`}
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
              {proceedDisabled ? 'Processing' : 'Proceed'}
            </Button>

            <SquidFooter />
          </>
        )}

        {!route && !showAddressMissmatchDrawer && (
        <LoadingView
          loadingText="Securing quote"
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
