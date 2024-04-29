import { AppCtx } from '../Context/app-context';
import {
  Box,
  Button,
  FormControl,
  TextInput,
  Heading,
  Select,
} from '@biom3/react';
import { ChangeEvent, useContext, useState } from 'react';

export const CreateOrder = () => {
  const { state } = useContext(AppCtx);
  const [amount, setAmount] = useState<undefined | string>(undefined);
  const [tokenAddress, setTokenAddress] = useState<undefined | string>(undefined);
  const [tokenId, setTokenId] = useState<undefined | string>(undefined);

  const createOrder = async () => {
    if (
      !amount ||
      !tokenAddress ||
      !tokenId
    ) {
      alert('missing requirements')
      return;
    }

    await state.metaMaskIMXProvider?.createOrder({
      // buy: {
      //   amount: '1000000000000000000',
      //   type: 'ETH',
      // },
      // sell: {
      //   tokenAddress: '0xacb3c6a43d15b907e8433077b6d38ae40936fe2c',
      //   tokenId: '194488020',
      //   type: 'ERC721',
      // }
      buy: {
        amount,
        type: 'ETH',
      },
      sell: {
        tokenAddress,
        tokenId,
        type: 'ERC721',
      }
    })
  };

  const renderCreateOrder = () => {
    const updateAmount = (event: ChangeEvent<HTMLInputElement>) => {
      setAmount(event.target.value)
    };
  
    const updateTokenAddress = (event: ChangeEvent<HTMLInputElement>) => {
      setTokenAddress(event.target.value)
    };

    const updateTokenId = (event: ChangeEvent<HTMLInputElement>) => {
      setTokenId(event.target.value)
    };
    
    return (
      <>
        <Heading size="medium">Create an order</Heading>
        <Box sx={{ mb: 'base.spacing.x4' }}>
          <FormControl sx={{ mb: 'base.spacing.x2' }}>
            <FormControl.Label>Amount:</FormControl.Label>
            <TextInput onChange={updateAmount} />
          </FormControl>
          <FormControl sx={{ mb: 'base.spacing.x2' }}>
            <FormControl.Label>Type:</FormControl.Label>
            <Select disabled selectedOption={'ETH'}>
              <Select.Option optionKey='ETH' selected>
                <Select.Option.Label>ETH</Select.Option.Label>
              </Select.Option>
            </Select>
          </FormControl>
          <FormControl sx={{ mb: 'base.spacing.x2' }}>
            <FormControl.Label>Token Address:</FormControl.Label>
            <TextInput onChange={updateTokenAddress} />
          </FormControl>
          <FormControl sx={{ mb: 'base.spacing.x2' }}>
            <FormControl.Label>Token Id:</FormControl.Label>
            <TextInput onChange={updateTokenId} />
          </FormControl>
          <FormControl sx={{ mb: 'base.spacing.x2' }}>
            <FormControl.Label>Type:</FormControl.Label>
            <Select disabled selectedOption={'ERC721'}>
              <Select.Option optionKey='ERC721' selected>
                <Select.Option.Label>ERC721</Select.Option.Label>
              </Select.Option>
            </Select>
          </FormControl>
        </Box>
        <Button onClick={() => createOrder()}>Create</Button>
      </>
    );
  };

  return (
    <Box sx={{ padding: 'base.spacing.x5' }}>
      {state.address && renderCreateOrder()}
    </Box>
  );
};
