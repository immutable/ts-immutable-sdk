import {
  ReactNode, useContext, useEffect, useState,
} from 'react';
import {
  Body,
  Button,
  centerFlexChildren,
  Divider,
  EllipsizedText,
  FramedImage,
  Heading,
  hFlex,
  Icon,
  Link,
  PriceDisplay,
  Stack,
} from '@biom3/react';
import { RouteResponse } from '@0xsquid/squid-types';
import { BigNumber, utils } from 'ethers';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { AddFundsContext } from '../context/AddFundsContext';
import { useRoutes } from '../hooks/useRoutes';
import { AddFundsReviewData } from '../../../context/view-context/AddFundsViewContextTypes';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { Chain, RiveStateMachineInput } from '../types';
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

interface ReviewProps {
  data: AddFundsReviewData;
  showBackButton: boolean;
  onBackButtonClick?: () => void;
  onCloseButtonClick?: () => void;
}

const FIXED_HANDOVER_DURATION = 2000;

const APPROVE_TXN_ANIMATION = '/access_coins.riv';
const EXECUTE_TXN_ANIMATION = '/purchasing_items.riv';

export function Review({
  data,
  showBackButton = false,
  onBackButtonClick,
  onCloseButtonClick,
}: ReviewProps) {
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
  const [getRouteIntervalId, setGetRouteIntervalId] = useState<
  NodeJS.Timer | undefined
  >();
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

  useEffect(() => {
    (async () => {
      await getFromAmountAndRoute();
      const setIntervalId = setInterval(getFromAmountAndRoute, 20000);
      setGetRouteIntervalId(setIntervalId);
    })();
    return () => {
      if (getRouteIntervalId) {
        clearInterval(getRouteIntervalId);
      }
    };
  }, []);

  const getChain = (chainId: string | undefined): Chain | undefined => chains?.find((chain) => chain.id === chainId);

  const getFeeCosts = (): number => route?.route.estimate.feeCosts.reduce(
    (acc, fee) => acc + Number(fee.amountUsd),
    0,
  ) ?? 0;

  const getAmountInUSDText = (amount: string | undefined): string => (amount ? `USD $${amount}` : '');

  const getAmountFormatted = (
    amount: string | undefined,
    decimals: number,
  ): string => {
    if (!amount) {
      return '0';
    }

    return utils.formatUnits(BigNumber.from(amount), decimals);
  };

  const getGasCostText = (): string => {
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
  };

  const showHandover = (
    animationPath: string,
    state: RiveStateMachineInput,
    headingText: string,
    subheadingText?: ReactNode,
    duration?: number,
  ) => {
    addHandover({
      animationUrl: getRemoteRive(checkout?.config.environment, animationPath),
      inputValue: state,
      duration,
      children: (
        <HandoverContent
          headingText={headingText}
          subheadingText={subheadingText}
        />
      ),
    });
  };

  const handleTransaction = async () => {
    if (!squid || !fromProvider || !route) {
      return;
    }

    try {
      clearInterval(getRouteIntervalId);
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
  };

  const onProceedClick = () => handleTransaction();

  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          onCloseButtonClick={onCloseButtonClick}
          showBack={showBackButton}
          onBackButtonClick={onBackButtonClick}
        />
      )}
    >
      {!route && <Heading>Loading...</Heading>}
      {route && (
        <Stack
          sx={{ w: '100%', flex: 1, p: 'base.spacing.x4' }}
          alignItems="stretch"
        >
          <Stack sx={{ minh: '60px' }} rc={<header />} justifyContent="center">
            <Heading weight="bold" sx={{ textAlign: 'center' }}>
              Review
            </Heading>
          </Stack>
          <Divider size="xSmall" sx={{ mb: 'base.spacing.x2' }} />

          <Stack rc={<section />} direction="row" gap="base.spacing.x2">
            <Stack>
              <FramedImage
                circularFrame
                sx={{ w: 'base.icon.size.400' }}
                use={(
                  <img
                    src={route?.route.estimate.fromToken.logoURI}
                    alt={route?.route.estimate.fromToken.name}
                  />
                )}
              />
            </Stack>
            <Stack sx={{ flex: 1 }} gap="base.spacing.x1">
              <Body>
                Pay with
                {route?.route.estimate.fromToken.name}
              </Body>
              <Stack
                direction="row"
                alignItems="center"
                sx={{ c: 'base.color.text.body.secondary' }}
                gap="base.spacing.x2"
              >
                <FramedImage
                  circularFrame
                  sx={{ w: 'base.icon.size.200' }}
                  use={(
                    <img
                      src={
                        getChain(route?.route.estimate.fromToken.chainId)
                          ?.iconUrl
                      }
                      alt={
                        getChain(route?.route.estimate.fromToken.chainId)?.name
                      }
                    />
                  )}
                />
                <Body size="small" sx={{ c: 'base.color.text.body.secondary' }}>
                  {getChain(route?.route.estimate.fromToken.chainId)?.name}
                </Body>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                sx={{ c: 'base.color.text.body.secondary' }}
                gap="base.spacing.x2"
              >
                <Icon icon="Wallet" sx={{ w: 'base.icon.size.200' }} />
                <Body size="small" sx={{ c: 'inherit' }}>
                  <EllipsizedText
                    size="small"
                    text={fromAddress ?? ''}
                    sx={{ c: 'inherit' }}
                  />
                </Body>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                sx={{ c: 'base.color.text.body.secondary' }}
                gap="base.spacing.x2"
              >
                <FramedImage
                  circularFrame
                  sx={{ w: 'base.icon.size.200' }}
                  use={(
                    <img
                      src={
                        getChain(route?.route.estimate.fromToken.chainId)
                          ?.nativeCurrency.iconUrl
                      }
                      alt={
                        getChain(route?.route.estimate.fromToken.chainId)
                          ?.nativeCurrency.name
                      }
                    />
                  )}
                />
                <Body size="small" sx={{ c: 'inherit' }}>
                  Includes Fees USD $
                  {getFeeCosts()}
                </Body>
              </Stack>
            </Stack>
            <Stack>
              <PriceDisplay
                price={getAmountFormatted(
                  route?.route.estimate.fromAmount,
                  route?.route.estimate.fromToken.decimals,
                )}
                weight="bold"
              >
                <PriceDisplay.Caption sx={{ mt: 'base.spacing.x1' }}>
                  {getAmountInUSDText(route?.route.estimate.fromAmountUSD)}
                </PriceDisplay.Caption>
              </PriceDisplay>
            </Stack>
          </Stack>

          <Divider
            size="xSmall"
            sx={{
              my: 'base.spacing.x2',
            }}
          />

          <Stack rc={<section />} direction="row" gap="base.spacing.x2">
            <Stack>
              <FramedImage
                circularFrame
                sx={{ w: 'base.icon.size.400' }}
                use={(
                  <img
                    src={route?.route.estimate.toToken.logoURI}
                    alt={route?.route.estimate.toToken.name}
                  />
                )}
              />
            </Stack>
            <Stack sx={{ flex: 1 }} gap="base.spacing.x1">
              <Body>
                Deliver
                {route?.route.estimate.toToken.name}
              </Body>
              <Stack
                direction="row"
                alignItems="center"
                sx={{ c: 'base.color.text.body.secondary' }}
                gap="base.spacing.x2"
              >
                <FramedImage
                  sx={{ w: 'base.icon.size.200' }}
                  use={(
                    <img
                      src={
                        getChain(route?.route.estimate.toToken.chainId)?.iconUrl
                      }
                      alt={
                        getChain(route?.route.estimate.toToken.chainId)?.name
                      }
                    />
                  )}
                />
                <Body size="small" sx={{ c: 'base.color.text.body.secondary' }}>
                  {getChain(route?.route.estimate.toToken.chainId)?.name}
                </Body>
              </Stack>

              <Stack
                direction="row"
                alignItems="center"
                sx={{ c: 'base.color.text.body.secondary' }}
                gap="base.spacing.x2"
              >
                <Icon icon="Wallet" />
                <Body size="small" sx={{ c: 'inherit' }}>
                  <EllipsizedText
                    size="small"
                    text={toAddress ?? ''}
                    sx={{ c: 'inherit' }}
                  />
                </Body>
              </Stack>
              <Stack
                direction="row"
                alignItems="center"
                sx={{ c: 'base.color.text.body.secondary' }}
                gap="base.spacing.x2"
              >
                <Icon icon="AirDrop" />
                <Body size="small" sx={{ c: 'inherit' }}>
                  {getGasCostText()}
                </Body>
              </Stack>
            </Stack>
            <Stack>
              <PriceDisplay
                price={getAmountFormatted(
                  route?.route.estimate.toAmount,
                  route?.route.estimate.toToken.decimals,
                )}
                weight="bold"
              >
                <PriceDisplay.Caption sx={{ mt: 'base.spacing.x1' }}>
                  {getAmountInUSDText(route?.route.estimate.toAmountUSD)}
                </PriceDisplay.Caption>
              </PriceDisplay>
            </Stack>
          </Stack>
          <Divider
            size="xSmall"
            sx={{
              my: 'base.spacing.x2',
            }}
          />

          <Body
            sx={{
              ...hFlex,
              ...centerFlexChildren,
              gap: 'base.spacing.x2',
              m: 'base.spacing.x4',
              c: 'base.color.text.body.secondary',
            }}
            size="small"
          >
            <SquidIcon />
            Powered by Squid
          </Body>

          <Button
            size="large"
            onClick={onProceedClick}
            disabled={proceedDisabled}
          >
            {proceedDisabled ? 'Processing' : 'Proceed'}
          </Button>
        </Stack>
      )}
    </SimpleLayout>
  );
}
