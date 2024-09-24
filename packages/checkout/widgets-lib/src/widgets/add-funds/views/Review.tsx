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
  SvgIcon,
} from '@biom3/react';
import { RouteResponse } from '@0xsquid/squid-types';
import { BigNumber, utils } from 'ethers';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { AddFundsContext } from '../context/AddFundsContext';
import { useRoutes } from '../hooks/useRoutes';
import { AddFundsReviewData } from '../../../context/view-context/AddFundsViewContextTypes';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { Chain } from '../types';

interface ReviewProps {
  data: AddFundsReviewData;
  showBackButton :boolean;
  onBackButtonClick?: () => void;
  onCloseButtonClick?: () => void;
}

export function Review({
  data,
  showBackButton = false,
  onBackButtonClick, onCloseButtonClick,
}: ReviewProps) {
  const { addFundsState } = useContext(AddFundsContext);
  const { getFromAmount, getRoute } = useRoutes();
  const [route, setRoute] = useState<RouteResponse | undefined>();

  async function getFromAmountAndRoute() {
    if (!addFundsState.squid) {
      return;
    }
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
      data.fromAddress,
      false,
    );
    setRoute(routeResponse);
  }

  useEffect(() => {
    (async () => {
      await getFromAmountAndRoute();
      setInterval(getFromAmountAndRoute, 20000);
    })();
  }, []);

  function getChain(chainId: string | undefined): Chain | undefined {
    return addFundsState.chains.find((chain) => chain.id === chainId);
  }

  function getFeeCosts(): number {
    return route?.route.estimate.feeCosts.reduce((acc, fee) => acc + Number(fee.amountUsd), 0) ?? 0;
  }

  function getFromAmountInUSDText(): string {
    return route?.route.estimate.fromAmountUSD ? `USD $${route?.route.estimate.fromAmountUSD}` : '';
  }

  function getFromAmountFormatted(): string {
    if (!route?.route.estimate.fromAmount) {
      return '0';
    }

    return utils.formatUnits(
      BigNumber.from(route.route.estimate.fromAmount),
      route?.route.estimate.fromToken.decimals,
    );
  }

  function getToAmountInUSDText(): string {
    return route?.route.estimate.toAmountUSD ? `USD $${route?.route.estimate.toAmountUSD}` : '';
  }

  function getToAmountFormatted(): string {
    if (!route?.route.estimate.toAmount) {
      return '0';
    }

    return utils.formatUnits(
      BigNumber.from(route.route.estimate.toAmount),
      route?.route.estimate.toToken.decimals,
    );
  }

  function getGasCostText(): string {
    if (!route?.route.estimate.gasCosts || route?.route.estimate.gasCosts.length === 0) {
      return '';
    }
    const totalGasFee = route?.route.estimate.gasCosts.reduce(
      (acc, gas) => acc.add(BigNumber.from(gas.amount)),
      BigNumber.from(0),
    );

    const formattedTotalGasFee = utils.formatUnits(totalGasFee, route?.route.estimate.gasCosts[0].token.decimals);

    return `Gas Refuel +${route.route.estimate.gasCosts[0].token.name} ${formattedTotalGasFee}`;
  }

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
                  text={data.fromAddress}
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
            <PriceDisplay price={getFromAmountFormatted()} weight="bold">
              <PriceDisplay.Caption sx={{ mt: 'base.spacing.x1' }}>
                {getFromAmountInUSDText()}
              </PriceDisplay.Caption>
            </PriceDisplay>
          </Stack>
        </Stack>

        <Divider
          size="xSmall"
          sx={{
            my: 'base.spacing.x6',
            ml: 'base.spacing.x12',
            w: 'calc(100% - 48px)',
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
                  text={data.fromAddress}
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
            <PriceDisplay price={getToAmountFormatted()} weight="bold">
              <PriceDisplay.Caption sx={{ mt: 'base.spacing.x1' }}>
                {getToAmountInUSDText()}
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
          <SvgIcon viewBox="0 0 55 55" sx={{ fill: '#eaf960' }}>
            {/* eslint-disable-next-line max-len */}
            <path d="M54.3074 23.2261L54.3019 23.1911L54.1512 23.1966C54.1512 23.1966 54.1479 23.2425 54.1468 23.2468L54.0966 23.249C54.0311 24.0966 53.8923 24.9015 53.6848 25.641C53.1758 27.4617 52.3228 29.301 51.2841 30.8203C50.1351 32.5023 48.7971 33.7485 47.4144 34.4246C46.5515 34.8473 45.6963 35.1575 44.8728 35.3464C44.2338 35.4906 43.6036 35.5627 43.0018 35.5627C40.9157 35.5627 39.0043 34.6846 37.473 33.0244C35.1061 30.4566 33.7354 26.0429 34.062 22.0399C34.1756 20.6397 34.3995 19.3367 34.6157 18.0773C35.0756 15.4036 35.472 13.0946 34.7304 10.6808C34.3329 9.38764 33.4929 8.38498 32.3636 7.85634C31.5947 7.49591 30.7919 7.31351 29.976 7.31351C27.3536 7.31351 25.1899 9.16045 24.1348 10.742C22.5238 13.1569 21.721 16.1976 21.934 19.0833C22.1328 21.7843 23.0688 23.5647 24.4734 25.9752C25.1779 27.1832 25.9118 28.2503 26.5606 29.1929C27.6572 30.7875 28.6042 32.1648 29.0716 33.6753C29.7193 35.7691 29.2693 36.7762 29.0454 37.1126C28.7691 37.5276 28.3256 37.7668 27.726 37.8236C27.6496 37.8312 27.5742 37.8345 27.501 37.8345C25.6705 37.8345 25.6355 35.3355 25.6148 33.8414V33.8075C25.6137 33.7092 25.6115 33.6153 25.6104 33.5257C25.5481 30.5996 24.4242 28.851 23 26.636C22.1065 25.2467 21.0941 23.6728 20.205 21.5288C18.7829 18.1036 18.4258 14.7996 19.1444 11.7097C19.1696 11.5994 19.1969 11.4891 19.2253 11.3777C20.0979 7.93826 22.2551 3.53333 27.572 2.08177C28.579 1.80653 29.6134 1.66673 30.6455 1.66673C33.7715 1.66673 36.4944 2.95336 38.1152 5.19569C39.427 7.00987 40.1031 9.06652 40.1839 11.4825C40.2035 12.057 40.1883 12.6588 40.1391 13.2716C40.0244 14.6532 39.7317 16.1681 39.2457 17.9015C38.2627 21.4053 38.0246 24.374 38.539 26.7234C38.9333 28.5255 39.7951 29.8984 40.9026 30.4893C41.8004 30.9677 42.7572 31.2102 43.7456 31.2102C46.2708 31.2102 48.571 29.5992 49.731 28.0034C51.555 25.4935 52.5161 21.0678 52.3589 18.4061C52.301 17.4297 52.218 16.6028 52.1033 15.8711L52.1 15.8601L52.0978 15.8547C49.9396 11.1876 46.5166 7.23159 42.199 4.41475C37.7701 1.52802 32.6192 0 27.3055 0C20.0117 0 13.1547 2.83977 7.99724 7.99724C2.84087 13.1547 0 20.0117 0 27.3055C0 29.4255 0.244657 31.5401 0.728511 33.5923L0.737249 33.6284L0.889068 33.6065C0.889068 33.6065 0.886883 33.5618 0.885791 33.5585L0.936033 33.5508C0.842102 31.9256 0.989552 30.3605 1.36309 29.0247C1.87207 27.205 2.72509 25.3646 3.76379 23.8454C4.91281 22.1644 6.25078 20.9171 7.63353 20.241C8.48983 19.8216 9.34067 19.5125 10.1609 19.3225C10.8053 19.1761 11.441 19.1029 12.0483 19.1029C14.1344 19.1029 16.0469 19.98 17.5771 21.6402C19.9439 24.2069 21.3147 28.6216 20.9881 32.6257C20.8745 34.027 20.6506 35.329 20.4333 36.5883C19.9734 39.262 19.577 41.571 20.3186 43.9848C20.7151 45.278 21.5561 46.2807 22.6854 46.8093C23.4543 47.1697 24.2571 47.3521 25.073 47.3521C27.6954 47.3521 29.8591 45.5052 30.9142 43.9226C32.5252 41.5077 33.328 38.4669 33.115 35.5813C32.9162 32.8813 31.9802 31.0999 30.5756 28.6894C29.8733 27.4846 29.1383 26.4154 28.4895 25.4717C27.3929 23.877 26.4459 22.4997 25.9785 20.9881C25.3308 18.8943 25.7808 17.8873 26.0036 17.552C26.2799 17.1369 26.7234 16.8977 27.323 16.8409C27.3994 16.8333 27.4759 16.83 27.548 16.83C29.3785 16.83 29.4135 19.3268 29.4342 20.8177L29.4353 20.8603C29.4364 20.9575 29.4386 21.0493 29.4397 21.1377C29.502 24.0638 30.6259 25.8124 32.0501 28.0275C32.9436 29.4168 33.956 30.9918 34.8451 33.1347C36.2224 36.4507 36.6003 39.6563 35.9701 42.6621C35.9526 42.7451 35.9341 42.8281 35.9155 42.9112C35.081 46.5002 32.9392 51.0919 27.477 52.5839C26.47 52.8591 25.4356 52.9978 24.4035 52.9989C21.2775 52.9989 18.5546 51.7123 16.9338 49.4699C15.622 47.6558 14.9459 45.5991 14.8651 43.1831C14.8531 42.8325 14.8542 42.4699 14.8673 42.1073C14.9307 40.5345 15.2376 38.7869 15.8044 36.7641C16.7874 33.2603 17.0255 30.2916 16.5111 27.9423C16.1168 26.139 15.255 24.7672 14.1475 24.1763C13.2497 23.6979 12.294 23.4554 11.3045 23.4554C8.78036 23.4554 6.47905 25.0665 5.31911 26.6622C3.49511 29.1721 2.53395 33.5978 2.69123 36.2595C2.78844 37.9132 2.95664 39.1288 3.23843 40.2068L3.24171 40.2156L3.24389 40.2199C8.01471 49.0953 17.2363 54.611 27.3055 54.611C34.5994 54.611 41.4563 51.7713 46.6138 46.6138C51.7713 41.4563 54.611 34.5994 54.611 27.3055C54.611 25.9424 54.5094 24.5695 54.3074 23.2261Z" />
          </SvgIcon>
          Powered by Squid
        </Body>

        <Button size="large">Proceed</Button>
      </Stack>
    </SimpleLayout>
  );
}
