import { useContext, useEffect, useState } from 'react';
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
  PriceDisplay,
  Stack,
} from '@biom3/react';
import { RouteResponse } from '@0xsquid/squid-types';
import { BigNumber, utils } from 'ethers';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { AddFundsContext } from '../context/AddFundsContext';
import { useRoutes } from '../hooks/useRoutes';
import { AddFundsReviewData, AddFundsWidgetViews } from '../../../context/view-context/AddFundsViewContextTypes';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { Chain } from '../types';
import { useExecute } from '../hooks/useExecute';
import { SharedViews, ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { SquidIcon } from '../components/SquidIcon';

interface ReviewProps {
  data: AddFundsReviewData;
  showBackButton: boolean;
  onBackButtonClick?: () => void;
  onCloseButtonClick?: () => void;
}

export function Review({
  data,
  showBackButton = false,
  onBackButtonClick, onCloseButtonClick,
}: ReviewProps) {
  const { viewDispatch } = useContext(ViewContext);
  const { addFundsState } = useContext(AddFundsContext);

  const [route, setRoute] = useState<RouteResponse | undefined>();
  const [fromAddress, setFromAddress] = useState<string | undefined>();
  const [getRouteIntervalId, setGetRouteIntervalId] = useState<NodeJS.Timer | undefined>();
  const [proceedDisabled, setProceedDisabled] = useState(true);

  const { getFromAmount, getRoute } = useRoutes();

  const {
    convertToNetworkChangeableProvider, checkProviderChain, approve, execute,
  } = useExecute();

  const getFromAmountAndRoute = async () => {
    if (!addFundsState.squid) {
      return;
    }

    const address = await addFundsState.provider?.getSigner().getAddress();
    if (!address) {
      return;
    }
    setFromAddress(address);

    const amountData = await getFromAmount(
      addFundsState.squid,
      data.balance,
      data.toAmount,
      data.toChainId,
      data.toTokenAddress,
    );

    if (!amountData) {
      return;
    }

    const routeResponse = await getRoute(
      addFundsState.squid,
      amountData?.fromToken,
      amountData?.toToken,
      data.toAmount,
      data.toTokenAddress,
      address,
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

  const getChain = (chainId: string | undefined)
  : Chain | undefined => addFundsState.chains?.find((chain) => chain.id === chainId);

  const getFeeCosts = (): number => route?.route.estimate.feeCosts.reduce((acc, fee) => acc + Number(fee.amountUsd), 0)
    ?? 0;

  const getAmountInUSDText = (amount: string | undefined): string => (amount ? `USD $${amount}` : '');

  const getAmountFormatted = (amount: string | undefined, decimals: number): string => {
    if (!amount) {
      return '0';
    }

    return utils.formatUnits(BigNumber.from(amount), decimals);
  };

  const getGasCostText = (): string => {
    if (!route?.route.estimate.gasCosts || route?.route.estimate.gasCosts.length === 0) {
      return '';
    }
    const totalGasFee = route?.route.estimate.gasCosts.reduce(
      (acc, gas) => acc.add(BigNumber.from(gas.amount)),
      BigNumber.from(0),
    );

    const formattedTotalGasFee = utils.formatUnits(totalGasFee, route?.route.estimate.gasCosts[0].token.decimals);

    return `Gas Refuel +${route.route.estimate.gasCosts[0].token.name} ${formattedTotalGasFee}`;
  };

  const onProceedClick = async () => {
    if (!addFundsState.squid || !addFundsState.provider || !route) {
      return;
    }
    try {
      clearInterval(getRouteIntervalId);
      setProceedDisabled(true);

      const provider = await convertToNetworkChangeableProvider(addFundsState.provider);
      await checkProviderChain(provider, route.route.params.fromChain);
      await approve(provider, route);
      const txReceipt = await execute(addFundsState.squid, provider, route);
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: AddFundsWidgetViews.CONFIRMATION,
            data: {
              transactionHash: txReceipt.transactionHash,
            },
          },
        },
      });
    } catch (e: unknown) {
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
      {!route && <Body>Loading...</Body>}
      {route && (
        <Stack sx={{ w: '100%', flex: 1, p: 'base.spacing.x4' }} alignItems="stretch">
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
                use={<img src={route?.route.estimate.fromToken.logoURI} alt={route?.route.estimate.fromToken.name} />}
              />
            </Stack>
            <Stack sx={{ flex: 1 }} gap="base.spacing.x1">
              <Body>
                Pay with
                {' '}
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
                      src={getChain(route?.route.estimate.fromToken.chainId)?.iconUrl}
                      alt={getChain(route?.route.estimate.fromToken.chainId)?.name}
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
                      src={getChain(route?.route.estimate.fromToken.chainId)?.nativeCurrency.iconUrl}
                      alt={getChain(route?.route.estimate.fromToken.chainId)?.nativeCurrency.name}
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
                price={getAmountFormatted(route?.route.estimate.fromAmount, route?.route.estimate.fromToken.decimals)}
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
                use={<img src={route?.route.estimate.toToken.logoURI} alt={route?.route.estimate.toToken.name} />}
              />
            </Stack>
            <Stack sx={{ flex: 1 }} gap="base.spacing.x1">
              <Body>
                Deliver
                {' '}
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
                      src={getChain(route?.route.estimate.toToken.chainId)?.iconUrl}
                      alt={getChain(route?.route.estimate.toToken.chainId)?.name}
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
                <Icon icon="AirDrop" />
                <Body size="small" sx={{ c: 'inherit' }}>
                  {getGasCostText()}
                </Body>
              </Stack>
            </Stack>
            <Stack>
              <PriceDisplay
                price={getAmountFormatted(route?.route.estimate.toAmount, route?.route.estimate.toToken.decimals)}
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

          <Button size="large" onClick={onProceedClick} disabled={proceedDisabled}>
            {proceedDisabled ? 'Processing'
              : 'Proceed'}
          </Button>
        </Stack>
      )}
    </SimpleLayout>
  );
}
