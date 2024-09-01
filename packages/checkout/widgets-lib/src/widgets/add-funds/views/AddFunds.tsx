/* eslint-disable no-console */
import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  IMTBLWidgetEvents,
  TokenFilterTypes,
  TokenInfo,
} from '@imtbl/checkout-sdk';
import {
  Body, Box, MenuItem, OverflowPopoverMenu,
} from '@biom3/react';
import { useContext, useEffect, useState } from 'react';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { amountInputValidation } from '../../../lib/validations/amountInputValidations';
import { TextInputForm } from '../../../components/FormComponents/TextInputForm/TextInputForm';
import { OptionsDrawer } from '../components/OptionsDrawer';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';
import { orchestrationEvents } from '../../../lib/orchestrationEvents';
import { OptionTypes } from '../components/Option';
import { AddFundsActions, AddFundsContext } from '../context/AddFundsContext';
import { getL2ChainId } from '../../../lib';

interface AddFundsProps {
  checkout?: Checkout;
  provider?: Web3Provider;
  showOnrampOption?: boolean;
  showSwapOption?: boolean;
  showBridgeOption?: boolean;
  tokenAddress?: string;
  amount?: string;
  onCloseButtonClick?: () => void;
  onBackButtonClick?: () => void;
}

export function AddFunds({
  checkout,
  provider,
  amount,
  tokenAddress,
  showOnrampOption = true,
  showSwapOption = true,
  showBridgeOption = true,
  onBackButtonClick,
  onCloseButtonClick,
}: AddFundsProps) {
  console.log('checkout', checkout);
  console.log('provider', provider);
  console.log('showOnrampOption', showOnrampOption);
  console.log('showSwapOption', showSwapOption);
  console.log('showBridgeOption', showBridgeOption);
  console.log('onCloseButtonClick', onCloseButtonClick);

  const { addFundsDispatch } = useContext(AddFundsContext);

  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const [showOptionsDrawer, setShowOptionsDrawer] = useState(false);
  const [allowedTokens, setAllowedTokens] = useState<TokenInfo[]>([]);
  const [toAmount, setToAmount] = useState<string>(amount || '0');
  const [toTokenAddress, setToTokenAddress] = useState<TokenInfo | undefined>();

  useEffect(() => {
    if (!checkout) return;

    const fetchTokens = async () => {
      const tokenResponse = await checkout.getTokenAllowList({
        type: TokenFilterTypes.SWAP,
        chainId: getL2ChainId(checkout.config),
      });

      if (tokenResponse?.tokens.length > 0) {
        setAllowedTokens(tokenResponse.tokens);

        if (tokenAddress) {
          const token = tokenResponse.tokens.find((t) => t.address === tokenAddress);
          setToTokenAddress(token);
        } else {
          setToTokenAddress(tokenResponse.tokens[0]);
        }

        addFundsDispatch({
          payload: {
            type: AddFundsActions.SET_ALLOWED_TOKENS,
            allowedTokens: tokenResponse.tokens,
          },
        });
      }
    };
    fetchTokens();
  }, [checkout]);

  const openDrawer = () => {
    setShowOptionsDrawer(true);
  };

  const updateAmount = (value: string) => {
    setToAmount(value);
  };

  const isSelected = (token: TokenInfo) => token.address === toTokenAddress;

  const handleTokenChange = (token: TokenInfo) => {
    setToTokenAddress(token);
  };

  // const handleReviewClick = () => {
  //   console.log('handle review click');
  // };

  const onPayWithCard = (paymentType: OptionTypes) => {
    console.log('paymentType', paymentType);
    console.log('=== toTokenAddress', toTokenAddress);
    console.log('=== toAmount', toAmount);

    if (paymentType === OptionTypes.SWAP) {
      orchestrationEvents.sendRequestSwapEvent(
        eventTarget,
        IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT,
        {
          toTokenAddress: toTokenAddress?.address ?? '',
          amount: toAmount ?? '',
          fromTokenAddress: '',
        },
      );
    } else {
      const data = {
        tokenAddress: toTokenAddress?.address ?? '',
        amount: toAmount ?? '',
      };
      orchestrationEvents.sendRequestOnrampEvent(
        eventTarget,
        IMTBLWidgetEvents.IMTBL_ADD_FUNDS_WIDGET_EVENT,
        data,
      );
    }
  };

  return (
    <SimpleLayout
      header={(
        <HeaderNavigation
          title="Add"
          onBackButtonClick={onBackButtonClick}
          onCloseButtonClick={onCloseButtonClick}
          showBack={!!onBackButtonClick}
        />
      )}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: 'base.spacing.x10',
          }}
        >
          <Box sx={{ width: 'base.spacing.x40' }}>
            <Box sx={{ marginBottom: 'base.spacing.x3' }}>
              <TextInputForm
                testId="add-funds-amount"
                type="number"
                value={toAmount}
                validator={amountInputValidation}
                onTextInputChange={(value) => updateAmount(value)}
                textAlign="right"
                inputMode="decimal"
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                borderRadius: 'base.borderRadius.x20',
                alignItems: 'center',
                gap: 'base.spacing.x5',
                justifyContent: 'center',
                border: '1px solid grey',

              }}
            >
              <Body size="large" weight="bold">
                {toTokenAddress ? toTokenAddress.name : ''}
              </Body>
              <OverflowPopoverMenu testId="add-funds-tokens-menu">
                {allowedTokens.map((token: any) => (
                  <MenuItem
                    key={token.address}
                    onClick={() => handleTokenChange(token)}
                    selected={isSelected(token)}
                  >
                    <MenuItem.Label>{token.name}</MenuItem.Label>
                  </MenuItem>
                ))}
              </OverflowPopoverMenu>
            </Box>
          </Box>
        </Box>

        <MenuItem
          size="small"
          emphasized
          onClick={() => {
            openDrawer();
          }}
        >
          <MenuItem.IntentIcon icon="ChevronExpand" />
          <MenuItem.Label size="medium">Choose payment option</MenuItem.Label>
        </MenuItem>
        <Box
          sx={{
            marginBottom: 'base.spacing.x10',
          }}
        >
          <OptionsDrawer
            visible={showOptionsDrawer}
            onClose={() => setShowOptionsDrawer(false)}
            onPayWithCard={onPayWithCard}
          />
        </Box>
        {/* <Button
          testId="add-funds-button"
          variant="primary"
          onClick={handleReviewClick}
          size="large"
          sx={{
            marginBottom: 'base.spacing.x10',
            mx: 'base.spacing.x3',
          }}
        >
          Review
        </Button> */}
      </Box>
    </SimpleLayout>
  );
}
