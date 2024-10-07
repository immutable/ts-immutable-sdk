import {
  ButtCon,
  Button,
  FramedIcon,
  FramedImage,
  HeroFormControl,
  HeroTextInput,
  OverflowDrawerMenu,
  Stack,
  Body,
  MenuItem,
} from '@biom3/react';
import debounce from 'lodash.debounce';
import {
  ChainId,
  type Checkout,
  IMTBLWidgetEvents,
  TokenFilterTypes,
  type TokenInfo,
} from '@imtbl/checkout-sdk';
import {
  type ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import {
  SharedViews,
  ViewActions,
  ViewContext,
} from '../../../context/view-context/ViewContext';
import { getL2ChainId } from '../../../lib';
import { orchestrationEvents } from '../../../lib/orchestrationEvents';
import { OptionsDrawer } from '../components/OptionsDrawer';
import { PayWithDrawer } from '../components/PayWithDrawer';
import { DeliverToDrawer } from '../components/DeliverToDrawer';
import { AddFundsActions, AddFundsContext } from '../context/AddFundsContext';
import { TokenImage } from '../../../components/TokenImage/TokenImage';
import { getDefaultTokenImage } from '../../../lib/utils';
import type { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';
import { useRoutes } from '../hooks/useRoutes';
import { SQUID_NATIVE_TOKEN } from '../utils/config';
import { AddFundsWidgetViews } from '../../../context/view-context/AddFundsViewContextTypes';
import type { RouteData } from '../types';
import { SelectedRouteOption } from '../components/SelectedRouteOption';

interface AddFundsProps {
  checkout?: Checkout;
  showBackButton?: boolean;
  showOnrampOption?: boolean;
  showSwapOption?: boolean;
  showBridgeOption?: boolean;
  toTokenAddress?: string;
  toAmount?: string;
  onCloseButtonClick?: () => void;
  onBackButtonClick?: () => void;
  config: StrongCheckoutWidgetsConfig;
}

export function AddFunds({
  checkout,
  toAmount,
  config,
  toTokenAddress,
  showOnrampOption = true,
  showSwapOption = true,
  showBridgeOption = true,
  onCloseButtonClick,
  showBackButton,
  onBackButtonClick,
}: AddFundsProps) {
  const {
    routes, fetchRoutesWithRateLimit, resetRoutes, fetchingRoutes,
  } = useRoutes();
  const {
    addFundsState: {
      squid, chains, balances, tokens,
    },
    addFundsDispatch,
  } = useContext(AddFundsContext);

  const { viewDispatch } = useContext(ViewContext);

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const [selectedRouteData, setSelectedRouteData] = useState<
  RouteData | undefined
  >(undefined);
  const [showOptionsDrawer, setShowOptionsDrawer] = useState(false);
  const [showPayWithDrawer, setShowPayWithDrawer] = useState(false);
  const [showDeliverToDrawer, setShowDeliverToDrawer] = useState(false);
  const [onRampAllowedTokens, setOnRampAllowedTokens] = useState<TokenInfo[]>(
    [],
  );
  const [allowedTokens, setAllowedTokens] = useState<TokenInfo[]>([]);
  const [inputValue, setInputValue] = useState<string>(toAmount || '');
  const [debouncedToAmount, setDebouncedToAmount] = useState<string>(inputValue);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | undefined>();

  const debouncedUpdateAmount = debounce((value: string) => {
    setDebouncedToAmount(value);
  }, 1500);

  const updateAmount = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInputValue(value);
    debouncedUpdateAmount(value);
  };

  const showErrorView = useCallback(
    (error: Error) => {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: SharedViews.ERROR_VIEW,
            error,
          },
        },
      });
    },
    [viewDispatch],
  );

  useEffect(() => {
    resetRoutes();

    if (
      balances
      && squid
      && tokens
      && selectedToken?.address
      && debouncedToAmount
    ) {
      fetchRoutesWithRateLimit(
        squid,
        tokens,
        balances,
        ChainId.IMTBL_ZKEVM_MAINNET.toString(),
        selectedToken.address === 'native'
          ? SQUID_NATIVE_TOKEN
          : selectedToken.address,
        debouncedToAmount,
        5,
        1000,
      );
    }
  }, [balances, squid, selectedToken, debouncedToAmount]);

  useEffect(() => {
    if (!selectedRouteData && routes.length > 0) {
      setSelectedRouteData(routes[0]);
    }
  }, [routes]);

  useEffect(() => {
    if (!checkout) {
      showErrorView(new Error('Checkout object is missing'));
      return;
    }

    const fetchTokens = async () => {
      try {
        const tokenResponse = await checkout.getTokenAllowList({
          type: TokenFilterTypes.SWAP,
          chainId: getL2ChainId(checkout.config),
        });

        if (tokenResponse?.tokens.length > 0) {
          setAllowedTokens(tokenResponse.tokens);

          if (toTokenAddress) {
            const token = tokenResponse.tokens.find(
              (t) => t.address?.toLowerCase() === toTokenAddress.toLowerCase(),
            );

            if (token) {
              setSelectedToken(token);
            }
          }

          addFundsDispatch({
            payload: {
              type: AddFundsActions.SET_ALLOWED_TOKENS,
              allowedTokens: tokenResponse.tokens,
            },
          });
        }
      } catch (error) {
        showErrorView(new Error('Failed to fetch tokens'));
      }
    };

    fetchTokens();
  }, [checkout, toTokenAddress]);

  useEffect(() => {
    if (!checkout) {
      showErrorView(new Error('Checkout object is missing'));
      return;
    }

    const fetchOnRampTokens = async () => {
      try {
        const tokenResponse = await checkout.getTokenAllowList({
          type: TokenFilterTypes.ONRAMP,
          chainId: getL2ChainId(checkout.config),
        });

        if (tokenResponse?.tokens.length > 0) {
          setOnRampAllowedTokens(tokenResponse.tokens);
        }
      } catch (error) {
        showErrorView(new Error('Failed to fetch onramp tokens'));
      }
    };
    fetchOnRampTokens();
  }, [checkout]);

  const isSelected = useCallback(
    (token: TokenInfo) => token.address === selectedToken,
    [selectedToken],
  );

  const handleTokenChange = useCallback((token: TokenInfo) => {
    setSelectedToken(token);
  }, []);

  const handleCardClick = () => {
    const data = {
      tokenAddress: selectedToken?.address ?? '',
      amount: debouncedToAmount ?? '',
    };
    orchestrationEvents.sendRequestOnrampEvent(
      eventTarget,
      IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT,
      data,
    );
  };

  const handleRouteClick = (route: RouteData) => {
    setShowOptionsDrawer(false);
    setShowPayWithDrawer(false);
    setShowDeliverToDrawer(false);
    setSelectedRouteData(route);
  };

  const handleReviewClick = () => {
    if (!debouncedToAmount || !selectedToken?.address || !selectedRouteData) {
      return;
    }

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: AddFundsWidgetViews.REVIEW,
          data: {
            balance: selectedRouteData.amountData.balance,
            toChainId: ChainId.IMTBL_ZKEVM_MAINNET.toString(),
            toTokenAddress: selectedToken.address,
            toAmount: debouncedToAmount,
          },
        },
      },
    });
  };

  const shouldShowOnRampOption = useMemo(() => {
    if (showOnrampOption && selectedToken) {
      const token = onRampAllowedTokens.find(
        (t) => t.address?.toLowerCase() === selectedToken.address?.toLowerCase(),
      );
      return !!token;
    }
    return false;
  }, [selectedToken, onRampAllowedTokens, showOnrampOption]);

  const showInitialEmptyState = !selectedToken;
  const defaultTokenImage = getDefaultTokenImage(
    checkout?.config.environment,
    config.theme,
  );
  const tokenChoiceOptions = useMemo(
    () => allowedTokens.map((token) => (
      <MenuItem
        size="medium"
        key={token.name}
        onClick={() => handleTokenChange(token)}
        selected={isSelected(token)}
        emphasized
      >
        <MenuItem.FramedImage
          circularFrame
          use={(
            <TokenImage
              src={token.icon}
              name={token.name}
              defaultImage={defaultTokenImage}
            />
            )}
          emphasized={false}
        />
        <MenuItem.Label>{token.symbol}</MenuItem.Label>
        {token.symbol !== token.name && (
        <MenuItem.Caption>{token.name}</MenuItem.Caption>
        )}
      </MenuItem>
    )),
    [allowedTokens, handleTokenChange, isSelected, defaultTokenImage],
  );
  const shouldShowBackButton = showBackButton ?? !!onBackButtonClick;

  const readyToReview = useMemo(
    () => !!debouncedToAmount && !!selectedRouteData && !!selectedToken?.address,
    [debouncedToAmount, selectedToken, selectedRouteData],
  );

  const loading = Boolean(
    (selectedToken?.address && debouncedToAmount && !selectedRouteData)
      || fetchingRoutes,
  );

  return (
    <SimpleLayout
      header={(
        <Stack
          direction="row"
          sx={{
            pos: 'absolute',
            w: '100%',
            top: '0px',
            pt: 'base.spacing.x4',
            px: 'base.spacing.x5',
          }}
          justifyContent="flex-start"
        >
          {shouldShowBackButton && (
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
      <Stack alignItems="center" sx={{ flex: 1 }}>
        <Stack
          testId="topSection"
          sx={{ flex: 1, px: 'base.spacing.x2', w: '100%', pt: 'base.spacing.x1' }}
          justifyContent="center"
          alignItems="center"
        >
          <OverflowDrawerMenu
            drawerSize="full"
            headerBarTitle="Add Token"
            drawerCloseIcon="ChevronExpand"
            {...(showInitialEmptyState
              ? { icon: 'Add', size: 'large', variant: 'tertiary' }
              : {
                customTarget: (
                  <FramedImage
                    size="xLarge"
                    use={(
                      <TokenImage
                        src={selectedToken?.icon}
                        name={selectedToken?.name}
                        defaultImage={defaultTokenImage}
                      />
                      )}
                    padded
                    emphasized
                    circularFrame
                    sx={{
                      cursor: 'pointer',
                      mb: 'base.spacing.x1',
                      // eslint-disable-next-line @typescript-eslint/naming-convention
                      '&:hover': {
                        boxShadow: ({ base }) => `0 0 0 ${base.border.size[200]} ${base.color.text.body.primary}`,
                      },
                    }}
                  />
                ),
              })}
          >
            {tokenChoiceOptions}
          </OverflowDrawerMenu>

          {showInitialEmptyState ? (
            <Body>Add Token</Body>
          ) : (
            <HeroFormControl>
              <HeroFormControl.Label>
                Add
                {' '}
                {selectedToken.symbol}
              </HeroFormControl.Label>
              <HeroTextInput
                testId="add-funds-amount-input"
                type="number"
                value={inputValue}
                onChange={(value) => updateAmount(value)}
                placeholder="0"
                maxTextSize="xLarge"
              />
              <HeroFormControl.Caption>USD $0.00</HeroFormControl.Caption>
            </HeroFormControl>
          )}
        </Stack>
        <Stack
          testId="bottomSection"
          sx={{
            alignSelf: 'stretch',
            p: 'base.spacing.x3',
            pb: 'base.spacing.x10',
            bg: 'base.color.neutral.800',
          }}
          gap="base.spacing.x6"
        >
          <Stack gap="0px">
            <MenuItem
              size="small"
              emphasized
              onClick={(event) => {
                event.stopPropagation();
                setShowPayWithDrawer(true);
              }}
            >
              <MenuItem.FramedIcon
                icon="Wallet"
                variant="bold"
                emphasized={false}
              />
              <MenuItem.Label>Pay with</MenuItem.Label>
              <MenuItem.BottomSlot>
                <MenuItem.BottomSlot.Divider />
                <SelectedRouteOption
                  loading={loading}
                  chains={chains}
                  balances={balances}
                  routeData={selectedRouteData}
                  onClick={() => setShowOptionsDrawer(true)}
                />
              </MenuItem.BottomSlot>
            </MenuItem>

            <Stack
              sx={{ pos: 'relative', h: 'base.spacing.x3' }}
              alignItems="center"
            >
              <FramedIcon
                icon="ArrowDown"
                sx={{
                  top: '0',
                  pos: 'absolute',
                  translate: ({ base }) => `0 -${base.spacing.x3}`,
                  bg: 'base.color.neutral.800'
                }}
              />
            </Stack>
            <MenuItem
              size="small"
              emphasized
              onClick={() => setShowDeliverToDrawer(true)}
            >
              <MenuItem.FramedIcon
                icon="Wallet"
                variant="bold"
                emphasized={false}
              />
              <MenuItem.Label>Deliver to</MenuItem.Label>
            </MenuItem>
          </Stack>

          <Button
            testId="add-funds-button"
            variant="secondary"
            onClick={handleReviewClick}
            size="large"
            disabled={!readyToReview}
          >
            Review
          </Button>
          <PayWithDrawer
            visible={showPayWithDrawer}
            onClose={() => setShowPayWithDrawer(false)}
          />
          <OptionsDrawer
            routes={routes}
            showOnrampOption={shouldShowOnRampOption}
            showSwapOption={showSwapOption}
            showBridgeOption={showBridgeOption}
            visible={showOptionsDrawer}
            onClose={() => setShowOptionsDrawer(false)}
            onCardClick={handleCardClick}
            onRouteClick={handleRouteClick}
          />
          <DeliverToDrawer
            visible={showDeliverToDrawer}
            onClose={() => setShowDeliverToDrawer(false)}
          />
        </Stack>
      </Stack>
    </SimpleLayout>
  );
}
