import {
  Checkout,
  FulfilmentTransaction,
  GasAmount,
  GasTokenType,
  ItemRequirement,
  ItemType,
  TransactionOrGasType,
} from '@imtbl/checkout-sdk';
import {
  Action, ActionType, TransactionPurpose, constants, Orderbook,
} from '@imtbl/orderbook';
import { Web3Provider } from '@ethersproject/providers';
import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import { Body, Box, Button, FormControl, Heading, Select, TextInput, Option, OptionKey } from '@biom3/react';
import LoadingButton from './LoadingButton';
import { ErrorMessage, SuccessMessage } from './messages';

interface SmartCheckoutProps {
  checkout: Checkout;
  provider: Web3Provider | undefined;
}

export const SmartCheckoutForm = ({ checkout, provider }: SmartCheckoutProps) => {
  const [itemRequirements, setItemRequirements] = useState<ItemRequirement[]>([]);
  const [itemRequirementsError, setItemRequirementsError] = useState<string>('');
  const [transactionOrGasAmount, setTransactionOrGasAmount] = useState<FulfilmentTransaction | GasAmount>(
    {
      type: TransactionOrGasType.GAS,
      gasToken: {
        type: GasTokenType.NATIVE,
        limit: BigNumber.from(400000),
      }
    }
  );
  const [error, setError] = useState<any>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

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
  const [contractAddress, setContractAddress] = useState<string>('');
  const [contractAddressError, setContractAddressError] = useState<string>('');
  const [spenderAddress, setSpenderAddress] = useState<string>('');
  const [spenderAddressError, setSpenderAddressError] = useState<string>('');

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

    setItemRequirementsError('');
    setError('');
    setLoading(true);

    try {
      checkout.smartCheckout(
        {
          provider,
          itemRequirements,
          transactionOrGasAmount,
        }
      );
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

  const updateItemRequirements = (itemRequirement: ItemRequirement) => {
    setItemRequirements([...itemRequirements, itemRequirement]);
  }

  const addNativeRequirement = () => {
    if (!amount) {
      setAmountError('Amount is required for native token');
      return;
    }
    const bn = BigNumber.from(amount);
    updateItemRequirements({
      type: ItemType.NATIVE,
      amount: bn,
    });
  }

  const addERC20Requirement = () => {
    if (!amount) {
      setAmountError('Amount is required for ERC20 token');
    }
    if (!contractAddress) {
      setContractAddressError('Contract address is required for ERC20 token');
    }
    if (!spenderAddress) {
      setSpenderAddressError('Spender address is required for ERC20 token');
    }
    if (!amount || !contractAddress || !spenderAddress) {
      return;
    }
    const bn = BigNumber.from(amount);
    updateItemRequirements({
      type: ItemType.ERC20,
      amount: bn,
      contractAddress,
      spenderAddress,
    });
  }

  const addERC721Requirement = () => {
    if (!id) {
      setIdError('ID is required for ERC721 token');
    }
    if (!contractAddress) {
      setContractAddressError('Contract address is required for ERC721 token');
    }
    if (!spenderAddress) {
      setSpenderAddressError('Spender address is required for ERC721 token');
    }
    if (!id || !contractAddress || !spenderAddress) {
      return;
    }
    updateItemRequirements({
      type: ItemType.ERC721,
      id,
      contractAddress,
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
  const getItemRequirementRow = (item: ItemRequirement, index: number) => {
    switch (item.type) {
      case ItemType.NATIVE:
        return (
          <tr key={index}>
            <td>{item.type}</td>
            <td>{item.amount.toString()}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        );
      case ItemType.ERC20:
        return (
          <tr key={index}>
            <td>{item.type}</td>
            <td>{item.amount.toString()}</td>
            <td></td>
            <td>{item.contractAddress}</td>
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
    setContractAddressError('');
    setSpenderAddressError('');

    switch (value) {
      case 'native':
        setItemType(ItemType.NATIVE);
        setDisableAmount(false);
        setDisabledId(true);
        setDisabledContractAddress(true);
        setDisabledSpenderAddress(true);
        setId('');
        setContractAddress('');
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
    setAmount(value.split('.')[0]);
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
              <Option optionKey="native">
                <Option.Label>Native</Option.Label>
              </Option>
              <Option optionKey="erc20">
                <Option.Label>ERC20</Option.Label>
              </Option>
              <Option optionKey="erc721">
                <Option.Label>ERC721</Option.Label>
              </Option>
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
              <FormControl validationStatus={contractAddressError ? 'error' : 'success'}>
                <TextInput
                  value={contractAddress}
                  disabled={disableContractAddress}
                  onChange={(event: any) => {
                    setContractAddress(event.target.value);
                    setContractAddressError('');
                  }}
                />
              {contractAddressError && (
                  <FormControl.Validation>{contractAddressError}</FormControl.Validation>
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
