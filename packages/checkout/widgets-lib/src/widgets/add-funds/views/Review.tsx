import {
  ReactNode, useCallback, useContext, useMemo, useState,
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
import { BigNumber, utils } from 'ethers';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { AddFundsContext } from '../context/AddFundsContext';
import { useRoutes } from '../hooks/useRoutes';
import { AddFundsReviewData } from '../../../context/view-context/AddFundsViewContextTypes';
import { RiveStateMachineInput } from '../types';
import { useExecute } from '../hooks/useExecute';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { SquidIcon } from '../components/SquidIcon';
import { useHandover } from '../../../lib/hooks/useHandover';
import { HandoverTarget } from '../../../context/handover-context/HandoverContext';
import { HandoverContent } from '../../../components/Handover/HandoverContent';
import { getRemoteRive } from '../../../lib/utils';
import { SQUID_NATIVE_TOKEN } from '../utils/config';
import { useProvidersContext } from '../../../context/providers-context/ProvidersContext';
import { LoadingView } from '../../../views/loading/LoadingView';
import { getDurationFormatted } from '../functions/getDurationFormatted';
import { useTranslation } from 'react-i18next';

interface ReviewProps {
  data: AddFundsReviewData;
  showBackButton: boolean;
  onBackButtonClick?: () => void;
  onCloseButtonClick?: () => void;
}

const FIXED_HANDOVER_DURATION = 2000;

const APPROVE_TXN_ANIMATION = '/access_coins.riv';
const EXECUTE_TXN_ANIMATION = '/purchasing_items.riv';

const isContentLoaded = (route: RouteResponse | undefined) => !!route;

const getAmountInUSDText = (amount: string | undefined) => (amount ? `USD $${amount}` : '');

const getAmountFormatted = (amount?: string, decimals?: number) => {
  if (!amount || typeof decimals !== 'number') {
    return '0';
  }

  return utils.formatUnits(BigNumber.from(amount), decimals);
};

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
  const { t } = useTranslation();
  const { viewDispatch } = useContext(ViewContext);
  const {
    addFundsState: { squid, chains, tokens },
  } = useContext(AddFundsContext);

  const {
    providersState: {
      checkout, fromProvider, fromAddress, toAddress,
    },
  } = useProvidersContext();

  const [route, setRoute] = useState<RouteResponse | undefined>();
  const [proceedDisabled, setProceedDisabled] = useState(true);

  const { getAmountData, getRoute } = useRoutes();
  const { addHandover, closeHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });

  const {
    convertToNetworkChangeableProvider,
    checkProviderChain,
    getAllowance,
    approve,
    execute,
  } = useExecute();

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
    );

    if (!amountData) return;

    const routeResponse = await getRoute(
      squid,
      amountData?.fromToken,
      amountData?.toToken,
      toAddress,
      amountData.fromAmount,
      fromAddress,
      false,
    );
    setRoute(routeResponse);
    setProceedDisabled(false);
  };

  const getChain = useCallback(
    (chainId: string | undefined) => chains?.find((chain) => chain.id === chainId),
    [chains],
  );

  const getRouteIntervalIdRef = useInterval(getFromAmountAndRoute, 20000);

  const feeCosts = useMemo(
    () => route?.route.estimate.feeCosts.reduce(
      (acc, fee) => acc + Number(fee.amountUsd),
      0,
    ) ?? 0,
    [route],
  );

  const formattedFeeCosts = useMemo(() => `USD $${feeCosts}`, [feeCosts]);

  /*
  @TODO: is this still needed?
  const gasCostText = useMemo((): string => {
    if (
      !route?.route.estimate.gasCosts
      || route?.route.estimate.gasCosts.length === 0
    ) {
      return '';
    }
    const totalGasFee = route?.route.estimate.gasCosts.reduce(
      (acc, gas) => acc.add(BigNumber.from(gas.amount)),
      BigNumber.from(0),
    );

    const formattedTotalGasFee = utils.formatUnits(
      totalGasFee,
      route?.route.estimate.gasCosts[0].token.decimals,
    );

    return `Gas Refuel +${route.route.estimate.gasCosts[0].token.name} ${formattedTotalGasFee}`;
  }, [route]);
  */

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

    try {
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
      await checkProviderChain(
        changeableProvider,
        route.route.params.fromChain,
      );

      const allowance = await getAllowance(changeableProvider, route);
      const { fromAmount } = route.route.params;

      if (allowance?.lt(fromAmount)) {
        showHandover(
          APPROVE_TXN_ANIMATION,
          RiveStateMachineInput.WAITING,
          'Waiting for access approval in your wallet',
          'Approve the transaction request to complete this transaction',
        );

        await approve(changeableProvider, route);

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
        'Waiting for transaction approval in wallet',
        'Approve the transaction request to complete this transaction',
      );

      const txReceipt = await execute(squid, changeableProvider, route);

      showHandover(
        APPROVE_TXN_ANIMATION,
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
                href={`https://axelarscan.io/gmp/${txReceipt.transactionHash}`}
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
    } catch (e) {
      closeHandover();

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.ERROR_VIEW,
            error: e as Error,
          },
        },
      });
    }
  }, [
    route,
    squid,
    fromProvider,
    getRouteIntervalIdRef,
    approve,
    showHandover,
    checkProviderChain,
    convertToNetworkChangeableProvider,
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
        {isContentLoaded(route) ? (
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
                    use={(
                      <img
                        src={
                          getChain(route.route.estimate.fromToken.chainId)
                            ?.iconUrl
                        }
                        alt={
                          getChain(route.route.estimate.fromToken.chainId)?.name
                        }
                      />
                    )}
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
                    {getChain(route.route.estimate.fromToken.chainId)?.name}
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
                  price={getAmountFormatted(
                    route.route.estimate.fromAmount,
                    route.route.estimate.fromToken.decimals,
                  )}
                  sx={{ flexShrink: 0, alignSelf: 'flex-start' }}
                >
                  <PriceDisplay.Caption size="small">
                    {getAmountInUSDText(route.route.estimate.fromAmountUSD)}
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
                    {route.route.estimate.fromToken.name}
                    {' '}
                    =
                    {' '}
                    {route.route.estimate.exchangeRate}
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
                        src={
                          getChain(route.route.estimate.toToken.chainId)
                            ?.nativeCurrency.iconUrl
                        }
                        alt={
                          getChain(route.route.estimate.toToken.chainId)
                            ?.nativeCurrency.name
                        }
                      />
                    )}
                    circularFrame
                    size="large"
                  />
                  <Sticker.FramedImage
                    use={(
                      <img
                        src={
                          getChain(route.route.estimate.toToken.chainId)
                            ?.iconUrl
                        }
                        alt={
                          getChain(route.route.estimate.toToken.chainId)?.name
                        }
                      />
                    )}
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
                    {getChain(route?.route.estimate.toToken.chainId)?.name}
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
                  price={getAmountFormatted(
                    route?.route.estimate.toAmount,
                    route?.route.estimate.toToken.decimals,
                  )}
                  sx={{ flexShrink: 0, alignSelf: 'flex-start' }}
                >
                  <PriceDisplay.Caption size="small">
                    {getAmountInUSDText(route?.route.estimate.toAmountUSD)}
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

                <Body
                  onClick={() => {
                    // eslint-disable-next-line no-console
                    console.log('@TODO');
                  }}
                  size="small"
                  sx={{
                    ...hFlex,
                    alignItems: 'center',
                    c: 'base.color.text.body.secondary',
                    cursor: 'pointer',
                  }}
                >
                  Included fees
                  {' '}
                  {formattedFeeCosts}
                  <Icon
                    icon="ChevronExpand"
                    sx={{ ml: 'base.spacing.x2', w: 'base.icon.size.200' }}
                  />
                </Body>
              </Stack>
            </Stack>

            <Button
              size="large"
              onClick={handleTransaction}
              disabled={proceedDisabled}
              sx={{ mt: 'auto', mb: 'base.spacing.x4', mx: 'base.spacing.x3' }}
            >
              {proceedDisabled ? 'Processing' : 'Proceed'}
            </Button>
          </>
        ) : (
          <LoadingView loadingText={t('views.LOADING_VIEW.text')} />
        )}
      </Stack>
    </SimpleLayout>
  );
}
