/* eslint-disable no-console */
import { Web3Provider } from '@ethersproject/providers';
import { Checkout } from '@imtbl/checkout-sdk';
import {
  Body,
  Box, Button, MenuItem, OverflowPopoverMenu,
} from '@biom3/react';
import { useState } from 'react';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { amountInputValidation } from '../../../lib/validations/amountInputValidations';
import { TextInputForm } from '../../../components/FormComponents/TextInputForm/TextInputForm';

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
  checkout, provider, amount, tokenAddress,
  showOnrampOption = true, showSwapOption = true, showBridgeOption = true,
  onBackButtonClick, onCloseButtonClick,

}: AddFundsProps) {
  console.log('checkout', checkout);
  console.log('provider', provider);
  console.log('showOnrampOption', showOnrampOption);
  console.log('showSwapOption', showSwapOption);
  console.log('showBridgeOption', showBridgeOption);
  console.log('onCloseButtonClick', onCloseButtonClick);

  const [toAmount, setToAmount] = useState<string>(amount || '');
  // eslint-disable-next-line max-len
  const [toTokenAddress, setToTokenAddress] = useState<string>(tokenAddress || '0x6B175474E89094C44Da98b954EedeAC495271');

  // TODO: get the tokens from the new method
  const tokens = [
    {
      name: 'USDC',
      address: '0x6B175474E89094C44Da98b954EedeAC495271',
    },
    {
      name: 'DAI',
      address: '0x6B175474E89094C44Da98b954EedeAC495272',
    },
    {
      name: 'USDT',
      address: '0x6B175474E89094C44Da98b954EedeedeACasd',
    },
  ];

  const updateAmount = (value: string) => {
    setToAmount(value);
  };

  const isSelected = (token: any) => token.address === toTokenAddress;

  const handleTokenChange = (token) => {
    setToTokenAddress(token.address);
  };

  const fromAddressToTokenName = (address: string) => {
    const token = tokens.find((t) => t.address === address);
    return token?.name || '';
  };

  const handleReviewClick = () => {
    console.log('handle review click');
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
      <Box sx={{
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%',
      }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 'base.spacing.x10' }}>
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

            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 'base.spacing.x5', justifyContent: 'center',
            }}
            >
              <Body size="large" weight="bold">{fromAddressToTokenName(toTokenAddress)}</Body>
              <OverflowPopoverMenu testId="add-funds-tokens-menu">
                {tokens.map((token: any) => (
                  <MenuItem key={token.address} onClick={() => handleTokenChange(token)} selected={isSelected(token)}>
                    <MenuItem.Label>{token.name}</MenuItem.Label>
                  </MenuItem>
                ))}

              </OverflowPopoverMenu>
            </Box>
          </Box>
        </Box>

        <Button
          testId="add-funds-button"
          variant="primary"
          onClick={handleReviewClick}
          size="large"
          sx={{ marginBottom: 'base.spacing.x10' }}
        >
          Review
        </Button>
      </Box>
    </SimpleLayout>

  );
}
