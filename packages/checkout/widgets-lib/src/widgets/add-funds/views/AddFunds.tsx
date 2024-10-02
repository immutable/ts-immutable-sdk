import {
  Body,
  ButtCon,
  Button,
  FramedIcon,
  FramedImage,
  HeroFormControl,
  HeroTextInput,
  MenuItem,
  OverflowDrawerMenu,
  Stack,
} from '@biom3/react';
import {
  type Checkout,
  IMTBLWidgetEvents,
  TokenFilterTypes,
  type TokenInfo,
} from '@imtbl/checkout-sdk';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
}

export function AddFunds({
  checkout,
  toAmount,
  toTokenAddress,
  showOnrampOption = true,
  showSwapOption = true,
  showBridgeOption = true,
  onCloseButtonClick,
  // @TODO: dont think these are needed anymore 
  // (according to the new designs)
  // showBackButton,
  // onBackButtonClick,
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
  const [currentToTokenAddress, setCurrentToTokenAddress] = useState<
  TokenInfo | undefined
  >();

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAmountChange = (value: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setCurrentToAmount(value);
    }, 1500);
  };

  const updateAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setInputValue(value);
    handleAmountChange(value);
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

          // @TODO: i think this can be removed...as we are starting off in the
          // default state, where no pay with and deliver to addresses are set ... ?
          // --------------------------------------------------------------------------------
          // const token = tokenResponse.tokens.find((t) => t.address === toTokenAddress)
          //   || tokenResponse.tokens[0];
          // setCurrentToTokenAddress(token);

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
          use={<img src={token.icon} alt="" />}
          emphasized={false}
        />
        <MenuItem.Label>{token.name}</MenuItem.Label>
      </MenuItem>
    )),
    [allowedTokens, handleTokenChange, isSelected],
  );

  return (
    <SimpleLayout
      header={(
        <ButtCon
          variant="tertiary"
          size="small"
          icon="Close"
          onClick={onCloseButtonClick}
          sx={{
            pos: 'absolute',
            top: 'base.spacing.x4',
            right: 'base.spacing.x5',
          }}
        />
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
                    use={<img src={currentToTokenAddress?.icon} alt={`${currentToTokenAddress.name} token`} />}
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
              <MenuItem.Label>Pay with</MenuItem.Label>
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
                }}
              />
            </Stack>
            <MenuItem
              size="small"
              emphasized
              onClick={() => console.log('@TODO - need to hook this up!')}
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
          >
            Review
          </Button>

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
