import {
  Checkout,
  ERC20ItemRequirement,
  ERC721ItemRequirement,
  FulfillmentTransaction,
  GasAmount,
  GasTokenType,
  ItemType,
  NativeItemRequirement,
  TransactionOrGasType,
} from '@imtbl/checkout-sdk';
import {
  Action, ActionType, TransactionPurpose, constants, Orderbook,
} from '@imtbl/orderbook';
import { useEffect, useState } from 'react';
import { Body, Box, Button, FormControl, Heading, Select, TextInput, OptionKey, Checkbox } from '@biom3/react';
import LoadingButton from './LoadingButton';
import { ErrorMessage, SuccessMessage } from './messages';
import { BrowserProvider, parseUnits as parseUnitsEthers } from 'ethers';

interface SmartCheckoutProps {
  checkout: Checkout;
  provider: BrowserProvider | undefined;
}

export const SmartCheckoutForm = ({ checkout, provider }: SmartCheckoutProps) => {
  const [itemRequirements, setItemRequirements] = useState<(NativeItemRequirement | ERC20ItemRequirement | ERC721ItemRequirement)[]>([]);
  const [itemRequirementsError, setItemRequirementsError] = useState<string>('');
  const [transactionOrGasAmount, setTransactionOrGasAmount] = useState<FulfillmentTransaction | GasAmount>(
    {
      type: TransactionOrGasType.GAS,
      gasToken: {
        type: GasTokenType.NATIVE,
        limit: BigInt(400000),
      }
    }
  );
  const [error, setError] = useState<any>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [onRampChecked, setOnRampChecked] = useState<boolean>(true);
  const [bridgeChecked, setBridgeChecked] = useState<boolean>(true);
  const [swapChecked, setSwapChecked] = useState<boolean>(true);

  const [seaportContractAddress, setSeaportContractAddress] = useState<string>('');

  const [disableAmount, setDisableAmount] = useState(true);
  const [disableId, setDisabledId] = useState(true);
  const [disableContractAddress, setDisabledContractAddress] = useState(true);
  const [disableSpenderAddress, setDisabledSpenderAddress] = useState(true);

  const [itemType, setItemType] = useState<ItemType | undefined>(undefined);
  const [amount, setAmount] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');
  const [id, setId] = useState<string>('');
  const [idError, setIdError] = useState<string>('');
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [tokenAddressError, setTokenAddressError] = useState<string>('');
  const [spenderAddress, setSpenderAddress] = useState<string>('');
  const [spenderAddressError, setSpenderAddressError] = useState<string>('');

  const [nativeGasAmountChecked, setNativeGasAmountChecked] = useState<boolean>(true);
  const [erc20GasAmountChecked, setErc20GasAmountChecked] = useState<boolean>(false);
  const [gasLimit, setGasLimit] = useState<string>('400000');
  const [gasLimitError, setGasLimitError] = useState<string>('');
  const [gasContractAddress, setGasContractAddress] = useState<string>('');
  const [gasContractAddressError, setGasContractAddressError] = useState<string>('');

  useEffect(() => {
    if (!checkout) return;

    const orderbook = new Orderbook({
      baseConfig: {
        environment: checkout.config.environment,
      },
    });

    const { seaportContractAddress } = orderbook.config();
    setSeaportContractAddress(seaportContractAddress);
  }, [checkout])

  async function smartCheckout() {
    setSuccess(false);

    if (itemRequirements.length === 0) {
      setItemRequirementsError('Add item requirements using the form above');
      return;
    }
    setItemRequirementsError('');

    if (!checkout) {
      setError('missing checkout, please connect first')
      return;
    }

    if (!provider) {
      setError('missing provider, please connect first')
      return;
    }

    if (!gasLimit) {
      setGasLimitError('Gas limit is required');
      return;
    }

    if (nativeGasAmountChecked) {
      setTransactionOrGasAmount({
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.NATIVE,
          limit: BigInt(gasLimit),
        }
      });
    }

    if (erc20GasAmountChecked) {
      if (!gasContractAddress) {
        setGasContractAddressError('Contract address is required for ERC20 gas token');
        return;
      }
      setTransactionOrGasAmount({
        type: TransactionOrGasType.GAS,
        gasToken: {
          type: GasTokenType.ERC20,
          limit: BigInt(gasLimit),
          tokenAddress: gasContractAddress,
        }
      });
    }

    setItemRequirementsError('');
    setError('');
    setLoading(true);

    try {
      const result = await checkout.smartCheckout(
        {
          provider,
          itemRequirements,
          transactionOrGasAmount,
          routingOptions: {
            onRamp: onRampChecked,
            swap: swapChecked,
            bridge: bridgeChecked,
          },
        }
      );
      console.log('Smart checkout result', result);
      setLoading(false);
      setSuccess(true);
    } catch (err: any) {
      setError(err);
      setLoading(false);
      console.log(err.message);
      console.log(err.type);
      console.log(err.data);
      console.log(err.stack);
    }
  }

  const updateItemRequirements = (itemRequirement: (NativeItemRequirement | ERC20ItemRequirement | ERC721ItemRequirement)) => {
    setItemRequirements([...itemRequirements, itemRequirement]);
  }

  const parseUnits = (amount: string): bigint => {
    return parseUnitsEthers(amount, 18);
  }

  const addNativeRequirement = () => {
    if (!amount) {
      setAmountError('Amount is required for native token');
      return;
    }
    updateItemRequirements({
      type: ItemType.NATIVE,
      amount,
    });
  }

  const addERC20Requirement = () => {
    if (!amount) {
      setAmountError('Amount is required for ERC20 token');
    }
    if (!tokenAddress) {
      setTokenAddressError('Contract address is required for ERC20 token');
    }
    if (!spenderAddress) {
      setSpenderAddressError('Spender address is required for ERC20 token');
    }
    if (!amount || !tokenAddress || !spenderAddress) {
      return;
    }

    updateItemRequirements({
      type: ItemType.ERC20,
      amount,
      tokenAddress,
      spenderAddress,
    });
  }

  const addERC721Requirement = () => {
    if (!id) {
      setIdError('ID is required for ERC721 token');
    }
    if (!tokenAddress) {
      setTokenAddressError('Contract address is required for ERC721 token');
    }
    if (!spenderAddress) {
      setSpenderAddressError('Spender address is required for ERC721 token');
    }
    if (!id || !tokenAddress || !spenderAddress) {
      return;
    }
    updateItemRequirements({
      type: ItemType.ERC721,
      id,
      contractAddress: tokenAddress,
      spenderAddress,
    });
  }

  const addItemRequirement = () => {
    switch (itemType) {
      case ItemType.NATIVE:
        addNativeRequirement();
        break;
      case ItemType.ERC20:
        addERC20Requirement();
        break;
      case ItemType.ERC721:
        addERC721Requirement();
        break;
    }
  }

  const clearItemRequirements = () => {
    setItemRequirements([]);
  }
  const getItemRequirementRow = (item: (NativeItemRequirement | ERC20ItemRequirement | ERC721ItemRequirement), index: number) => {
    switch (item.type) {
      case ItemType.NATIVE:
        return (
          <tr key={index}>
            <td>{item.type}</td>
            <td>{item.amount}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        );
      case ItemType.ERC20:
        return (
          <tr key={index}>
            <td>{item.type}</td>
            <td>{item.amount}</td>
            <td></td>
            <td>{item.tokenAddress}</td>
            <td>{item.spenderAddress}</td>
          </tr>
        );
      case ItemType.ERC721:
        return (
          <tr key={index}>
            <td>{item.type}</td>
            <td></td>
            <td>{item.id}</td>
            <td>{item.contractAddress}</td>
            <td>{item.spenderAddress}</td>
          </tr>
        )
    }
  }

  const selectItemType = (value: OptionKey) => {
    setAmountError('');
    setIdError('');
    setTokenAddressError('');
    setSpenderAddressError('');

    switch (value) {
      case 'native':
        setItemType(ItemType.NATIVE);
        setDisableAmount(false);
        setDisabledId(true);
        setDisabledContractAddress(true);
        setDisabledSpenderAddress(true);
        setId('');
        setTokenAddress('');
        setSpenderAddress('');
        break;
      case 'erc20':
        setItemType(ItemType.ERC20);
        setDisableAmount(false);
        setDisabledId(true);
        setDisabledContractAddress(false);
        setDisabledSpenderAddress(false);
        setId('');
        break;
      case 'erc721':
        setItemType(ItemType.ERC721);
        setDisableAmount(true);
        setDisabledId(false);
        setDisabledContractAddress(false);
        setDisabledSpenderAddress(false);
        setAmount('');
        break;
    }
  }

  const updateAmount = (event: any) => {
    const value = event.target.value;
    setAmount(value);
    setAmountError('');
  }

  const updateSpenderAddress = (event: any) => {
    setSpenderAddress(event.target.value);
    setSpenderAddressError('');
  }

  const itemRequirementsTable = () => {
    return (
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>ID</th>
            <th>Contract Address</th>
            <th>Spender Address</th>
          </tr>
        </thead>
        <tbody>
          {itemRequirements.map((item, index) => getItemRequirementRow(item, index))}
          <tr key="form">
            <td>
            <Select
              onSelectChange={selectItemType}
              defaultLabel='Select Item Type'
            >
              <Select.Option optionKey="native">
                <Select.Option.Label>Native</Select.Option.Label>
              </Select.Option>
              <Select.Option optionKey="erc20">
                <Select.Option.Label>ERC20</Select.Option.Label>
              </Select.Option>
              <Select.Option optionKey="erc721">
                <Select.Option.Label>ERC721</Select.Option.Label>
              </Select.Option>
            </Select>
            </td>
            <td>
              <FormControl validationStatus={amountError ? 'error' : 'success'}>
                <TextInput
                  value={amount}
                  disabled={disableAmount}
                  type='number'
                  onChange={updateAmount}
                />
                {amountError && (
                  <FormControl.Validation>{amountError}</FormControl.Validation>
                )}
              </FormControl>
            </td>
            <td>
              <FormControl validationStatus={idError ? 'error' : 'success'}>
                <TextInput
                  value={id}
                  disabled={disableId}
                  type='number'
                  onChange={(event: any) => {
                    setId(event.target.value);
                    setIdError('');
                  }}
                />
                {idError && (
                  <FormControl.Validation>{idError}</FormControl.Validation>
                )}
              </FormControl>
            </td>
            <td>
              <FormControl validationStatus={tokenAddressError ? 'error' : 'success'}>
                <TextInput
                  value={tokenAddress}
                  disabled={disableContractAddress}
                  onChange={(event: any) => {
                    setTokenAddress(event.target.value);
                    setTokenAddressError('');
                  }}
                />
              {tokenAddressError && (
                  <FormControl.Validation>{tokenAddressError}</FormControl.Validation>
                )}
              </FormControl>
            </td>
            <td>
              <FormControl validationStatus={spenderAddressError ? 'error' : 'success'}>
                <TextInput
                  value={spenderAddress}
                  disabled={disableSpenderAddress}
                  onChange={updateSpenderAddress}
                >
                  <TextInput.Button
                    onClick={() => {
                      setSpenderAddress(seaportContractAddress);
                      setSpenderAddressError('');
                    }}
                  >
                    Seaport
                  </TextInput.Button>
                </TextInput>
                {spenderAddressError && (
                  <FormControl.Validation>{spenderAddressError}</FormControl.Validation>
                )}
              </FormControl>
            </td>
            <td>
              <Button
                disabled={!itemType}
                size="small"
                onClick={addItemRequirement}
              >
                Add Item Requirement
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }

  const updateGasLimit = (event: any) => {
    const value = event.target.value;
    setGasLimit(value.split('.')[0]);
    setGasLimitError('');
  }

  const updateGasContractAddress = (event: any) => {
    setGasContractAddress(event.target.value);
    setGasContractAddressError('');
  }

  const fundingRoutesForm = () => {
    return(
      <>
        <Body>Set Funding Options</Body>
        <Box sx={{ display: 'flex' }}>
          <FormControl sx={{ padding: 'base.spacing.x4' }}>
            <FormControl.Label>OnRamp</FormControl.Label>
            <Checkbox
              checked={onRampChecked}
              onChange={() => {
                setOnRampChecked(!onRampChecked);
              }}
            />
          </FormControl>
          <FormControl sx={{ padding: 'base.spacing.x4' }}>
            <FormControl.Label>Swap</FormControl.Label>
            <Checkbox
              checked={swapChecked}
              onChange={() => {
                setSwapChecked(!swapChecked);
              }}
            />
          </FormControl>
          <FormControl sx={{ padding: 'base.spacing.x4' }}>
            <FormControl.Label>Bridge</FormControl.Label>
            <Checkbox
              checked={bridgeChecked}
              onChange={() => {
                setBridgeChecked(!bridgeChecked);
              }}
            />
          </FormControl>
        </Box>
      </>
    )
  }

  const gasAmountForm = () => {
    return(
      <>
        <Body>Set Gas Amount</Body>
        <Box sx={{ display: 'flex' }}>
          <FormControl sx={{ padding: 'base.spacing.x4' }}>
            <FormControl.Label>Native</FormControl.Label>
              <Checkbox
                checked={nativeGasAmountChecked}
                onChange={() => {
                  setNativeGasAmountChecked(!nativeGasAmountChecked);
                  setErc20GasAmountChecked(!erc20GasAmountChecked);
                  setGasContractAddress('');
                  setGasContractAddressError('');
                }}
              />
          </FormControl>
          <FormControl sx={{ padding: 'base.spacing.x4' }}>
            <FormControl.Label>ERC20</FormControl.Label>
              <Checkbox
                checked={erc20GasAmountChecked}
                onChange={() => {
                  setErc20GasAmountChecked(!erc20GasAmountChecked);
                  setNativeGasAmountChecked(!nativeGasAmountChecked);
                }}
              />
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex' }}>
          <FormControl
            sx={{ paddingLeft: 'base.spacing.x4' }}
            validationStatus={gasLimitError ? 'error' : 'success'}
          >
            <FormControl.Label>Limit</FormControl.Label>
            <TextInput
              type='number'
              value={gasLimit}
              onChange={updateGasLimit}
            >
              <TextInput.Button
                onClick={() => {
                  setGasLimit('400000');
                  setGasLimitError('');
                }}
              >
                Default
              </TextInput.Button>
            </TextInput>
            {gasLimitError && (
              <FormControl.Validation>{gasLimitError}</FormControl.Validation>
            )}
          </FormControl>
          {erc20GasAmountChecked && (
            <FormControl
              sx={{ paddingLeft: 'base.spacing.x4' }}
              validationStatus={gasContractAddressError ? 'error' : 'success'}
            >
              <FormControl.Label>Contract Address</FormControl.Label>
              <TextInput
                value={gasContractAddress}
                onChange={updateGasContractAddress}
              />
              {gasContractAddressError && (
                <FormControl.Validation>{gasContractAddressError}</FormControl.Validation>
              )}
            </FormControl>
          )}
        </Box>
      </>
    )
  }

  return(
    <Box>
      <Body>
        Add item requirements below and click Run Smart Checkout to run the smart checkout function with the item requirements.
      </Body>
      <Box sx={{
        paddingTop: 'base.spacing.x4',
        paddingBottom: 'base.spacing.x8'
      }} >
        {itemRequirementsTable()}
        <Button sx={{ marginTop: 'base.spacing.x2' }} size='small' onClick={clearItemRequirements}>
          Clear Item Requirements
        </Button>
      </Box>
      <Box sx={{
        paddingTop: 'base.spacing.x4',
        paddingBottom: 'base.spacing.x8'
      }} >
        {fundingRoutesForm()}
        {gasAmountForm()}
      </Box>
      <LoadingButton onClick={smartCheckout} loading={loading}>
        Run Smart Checkout
      </LoadingButton>
      {itemRequirementsError && (
        <ErrorMessage>
          {itemRequirementsError}
        </ErrorMessage>
      )}
      {error && (
        <ErrorMessage>
          {error.message}. Check console logs for more details.
        </ErrorMessage>
      )}
      {success && <SuccessMessage>Checkout success - view console for info.</SuccessMessage>}
    </Box>
  )
}
