import {
  Body,
  ButtCon,
  // Button,
  // FramedIcon,
  FramedImage,
  HeroFormControl,
  HeroTextInput,
  MenuItem,
  OverflowDrawerMenu,
  Stack,
} from '@biom3/react';
import debounce from 'lodash.debounce';
import {
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
import { OptionTypes } from '../components/Option';
import { OptionsDrawer } from '../components/OptionsDrawer';
import { AddFundsActions, AddFundsContext } from '../context/AddFundsContext';
import { TokenImage } from '../../../components/TokenImage/TokenImage';
import { getDefaultTokenImage } from '../../../lib/utils';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';

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
  toTokenAddress,
  showOnrampOption = true,
  showSwapOption = true,
  showBridgeOption = true,
  onCloseButtonClick,
  showBackButton,
  onBackButtonClick,
}: AddFundsProps) {
  const { addFundsDispatch } = useContext(AddFundsContext);
  const { viewDispatch } = useContext(ViewContext);

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const [showOptionsDrawer, setShowOptionsDrawer] = useState(false);
  const [onRampAllowedTokens, setOnRampAllowedTokens] = useState<TokenInfo[]>(
    [],
  );
  const [allowedTokens, setAllowedTokens] = useState<TokenInfo[]>([]);
  const [inputValue, setInputValue] = useState<string>(toAmount || '');
  // @TODO: the debouncedToAmount is likely what we need to use for USD
  // pricing and route calculations, etc
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [debouncedToAmount, setDebouncedToAmount] = useState<
  string | undefined
  >(inputValue);
  const [currentToTokenAddress, setCurrentToTokenAddress] = useState<
  TokenInfo | undefined
  >();

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

  const openDrawer = () => {
    setShowOptionsDrawer(true);
  };

  const isSelected = useCallback(
    (token: TokenInfo) => token.address === currentToTokenAddress,
    [currentToTokenAddress],
  );
  // const isDisabled = !currentToTokenAddress || !currentToAmount || Number.parseFloat(currentToAmount) <= 0;

  const handleTokenChange = useCallback((token: TokenInfo) => {
    setCurrentToTokenAddress(token);
  }, []);

  const handleReviewClick = useCallback(() => {
    // eslint-disable-next-line no-console
    console.log('handle review click');
  }, []);

  const onPayWithCard = (paymentType: OptionTypes) => {
    if (paymentType === OptionTypes.SWAP) {
      orchestrationEvents.sendRequestSwapEvent(
        eventTarget,
        IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT,
        {
          toTokenAddress: currentToTokenAddress?.address ?? '',
          amount: toAmount ?? '',
          fromTokenAddress: '',
        },
      );
    } else {
      const data = {
        tokenAddress: currentToTokenAddress?.address ?? '',
        amount: toAmount ?? '',
      };
      orchestrationEvents.sendRequestOnrampEvent(
        eventTarget,
        IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT,
        data,
      );
    }
  };

  const shouldShowOnRampOption = useMemo(() => {
    if (showOnrampOption && currentToTokenAddress) {
      const token = onRampAllowedTokens.find(
        (t) => t.address?.toLowerCase()
          === currentToTokenAddress.address?.toLowerCase(),
      );
      return !!token;
    }
    return false;
  }, [currentToTokenAddress, onRampAllowedTokens, showOnrampOption]);

  const showInitialEmptyState = !currentToTokenAddress;
  const defaultTokenImage = getDefaultTokenImage(
    checkout?.config.environment,
    checkout?.config.theme,
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
        <MenuItem.Label>{token.name}</MenuItem.Label>
      </MenuItem>
    )),
    [allowedTokens, handleTokenChange, isSelected, defaultTokenImage],
  );
  const shouldShowBackButton = showBackButton ?? !!onBackButtonClick;

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
          sx={{ flex: 1, px: 'base.spacing.x2', w: '100%' }}
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
                      <img
                        src={currentToTokenAddress?.icon}
                        alt={`${currentToTokenAddress.name} token`}
                      />
                      )}
                    padded
                    emphasized
                    circularFrame
                    sx={{
                      cursor: 'pointer',
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
                {currentToTokenAddress.symbol}
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
            <MenuItem size="small" emphasized onClick={openDrawer}>
              <MenuItem.FramedIcon
                icon="Dollar"
                variant="bold"
                emphasized={false}
              />
              <MenuItem.Label>
                {/* Pay with */}
                Choose payment option
              </MenuItem.Label>
            </MenuItem>
            {/*  @TODO: commented out for now, till these features are ready to go
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
                }}
              />
            </Stack> */}
            {/* @TODO: commented out for now, till these features are ready to go
            <MenuItem
              size="small"
              emphasized
              // onClick={() => {
              //   // eslint-disable-next-line no-console
              //   console.log('@TODO - need to hook this up!');
              // }}
            >
              <MenuItem.FramedIcon
                icon="Wallet"
                variant="bold"
                emphasized={false}
              />
              <MenuItem.Label>Deliver to</MenuItem.Label>
            </MenuItem> */}
          </Stack>

          {/*
            @TODO: commented out for now, till these features are ready to go
          <Button
            testId="add-funds-button"
            variant="secondary"
            onClick={handleReviewClick}
            size="large"
          >
            Review
          </Button> */}

          <OptionsDrawer
            showOnrampOption={shouldShowOnRampOption}
            showSwapOption={showSwapOption}
            showBridgeOption={showBridgeOption}
            visible={showOptionsDrawer}
            onClose={() => setShowOptionsDrawer(false)}
            onPayWithCard={onPayWithCard}
          />
        </Stack>
      </Stack>
    </SimpleLayout>
  );
}
