import React, { useEffect, useState } from 'react';
import {
  Button, Form, Offcanvas, Spinner, Stack,
} from 'react-bootstrap';
import { Heading } from '@biom3/react';
import { RequestProps } from '@/types';
import { useStatusProvider } from '@/context/StatusProvider';
import { usePassportProvider } from '@/context/PassportProvider';
import { Web3Provider } from '@ethersproject/providers'
import { Contract, utils } from 'ethers';

enum EthereumParamType {
  string = 'string',
  flag = 'flag',
  object = 'object',
}

interface EthereumParam {
  name: string;
  type?: EthereumParamType;
  default?: string;
}

interface EthereumMethod {
  name: string;
  params?: Array<EthereumParam>;
}

const EthereumMethods: EthereumMethod[] = [
  { name: 'eth_requestAccounts' },
  { name: 'eth_accounts' },
  {
    name: 'eth_sendTransaction',
    params: [
      { name: 'transaction', type: EthereumParamType.object },
    ],
  },
  { name: 'eth_gasPrice' },
  {
    name: 'eth_getBalance',
    params: [
      { name: 'address' },
      { name: 'blockNumber/tag', default: 'latest' },
    ],
  },
  {
    name: 'eth_getStorageAt',
    params: [
      { name: 'address' },
      { name: 'position' },
      { name: 'blockNumber', default: 'latest' },
    ],
  },
  {
    name: 'eth_estimateGas',
    params: [
      { name: 'transaction', type: EthereumParamType.object },
    ],
  },
  {
    name: 'eth_call',
    params: [
      { name: 'transaction' },
      { name: 'blockNumber/tag', default: 'latest' },
    ],
  },
  { name: 'eth_blockNumber' },
  { name: 'eth_chainId' },
  {
    name: 'eth_getBlockByHash',
    params: [
      { name: 'hash' },
      { name: 'transaction_detail_flag', type: EthereumParamType.flag },
    ],
  },
  {
    name: 'eth_getBlockByNumber',
    params: [
      { name: 'blockNumber/tag' },
      { name: 'transaction_detail_flag', type: EthereumParamType.flag },
    ],
  },
  {
    name: 'eth_getTransactionByHash',
    params: [
      { name: 'hash' },
    ],
  },
  {
    name: 'eth_getTransactionReceipt',
    params: [
      { name: 'hash' },
    ],
  },
  {
    name: 'eth_getTransactionCount',
    params: [
      { name: 'address' },
    ],
  },
];

export const ERC20ABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    type: 'function',
  },
];

function Request({ showRequest, setShowRequest }: RequestProps) {
  const [selectedEthMethod, setSelectedEthMethod] = useState<EthereumMethod>(EthereumMethods[0]);
  const [params, setParams] = useState<string[]>([]);
  const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
  const [isInvalid, setInvalid] = useState<boolean | undefined>(undefined);

  const { addMessage } = useStatusProvider();
  const { zkEvmProvider } = usePassportProvider();

  useEffect(() => {
    (async () => {
      if(zkEvmProvider) {
        console.log('Passport zkEVMProvider is: ', zkEvmProvider);
        const web3Provider = new Web3Provider(zkEvmProvider);
        if((web3Provider.provider as any)?.isPassport) {
          console.log('underlying provider is passport')
        }
        const network = await web3Provider.getNetwork();
        console.log('web3Provider network: ', network);

        const isConnected = (await zkEvmProvider.request({method: 'eth_accounts', params: []})).length > 0;

        let address = ''
        if(isConnected) {
          address = await web3Provider.getSigner().getAddress();
          console.log('web3Provider address: ', address)
          const balance = await web3Provider.getBalance(address);
          console.log('web3Provider balance: ', balance);
        }

        try {
         const response =  await zkEvmProvider.request({method: 'wallet_switchEthereumChain', params: [{chainId: '0x1'}]})
         console.log('switch chain response: ', response)
        } catch (error) {
          console.log(error)
        }

        try {
          const response  = await web3Provider.getSigner().sendTransaction({
            to: '0xe98b61832248c698085ffbc4313deb465be857e7',
            value: '100000000000000'
          })
        } catch(error) {
          console.log(error)
        }

        const contract = new Contract(
          '0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2', // zkTKN
          JSON.stringify(ERC20ABI),
          web3Provider,
        );
        const name = await contract.name();
        console.log(name);
        const symbol = await contract.symbol();
        console.log(symbol);
        const balance = await contract.balanceOf('0xe98b61832248c698085ffbc4313deb465be857e7');
        console.log(balance);
        const decimals = await contract.decimals();
        console.log(decimals);
        const formattedBalance = utils.formatUnits(balance, decimals);
        console.log(formattedBalance);

      }
    })()
    
  }, [zkEvmProvider])

  const resetForm = () => {
    setParams([]);
    setInvalid(false);
  };

  const handleClose = () => {
    resetForm();
    setShowRequest(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const form = e.currentTarget;
    if (form.checkValidity()) {
      setInvalid(false);
      setLoadingRequest(true);
      try {
        const result = await zkEvmProvider?.request({
          method: selectedEthMethod?.name || '',
          params: params.map((param, i) => {
            switch (selectedEthMethod.params![i].type) {
              case EthereumParamType.flag: {
                return param === 'true';
              }
              case EthereumParamType.object: {
                console.log(param);
                return JSON.parse(param);
              }
              default: {
                return param;
              }
            }
          }),
        });
        setLoadingRequest(false);
        addMessage(selectedEthMethod?.name, result);
        handleClose();
      } catch (err) {
        addMessage('Request', err);
        handleClose();
      }
    } else {
      setInvalid(true);
    }
  };

  const handleSetEthMethod = (e: React.ChangeEvent<HTMLSelectElement>) => {
    resetForm();
    const ethMethod = EthereumMethods.find((method) => method.name === e.target.value);
    if (!ethMethod) {
      console.error('Invalid eth method');
    } else {
      setSelectedEthMethod(ethMethod);
      setParams(ethMethod.params ? ethMethod.params.map((param) => param.default || '') : []);
    }
  };

  return (
    <Offcanvas
      show={showRequest}
      onHide={handleClose}
      backdrop="static"
      placement="end"
      style={{ width: '35%' }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title><Heading>Request</Heading></Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form noValidate validated={isInvalid} onSubmit={handleSubmit} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>Ethereum Method</Form.Label>
            <Form.Select onChange={handleSetEthMethod}>
              {
                EthereumMethods.map((method) => (
                  <option key={method.name} value={method.name}>{method.name}</option>
                ))
              }
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            {
              selectedEthMethod?.params?.map((param, index) => (
                <div key={param.name}>
                  <Form.Label>{param.name}</Form.Label>
                  <Form.Control
                    key={param.name}
                    type="text"
                    value={param.default}
                    onChange={(e) => {
                      const newParams = [...params];
                      newParams[index] = e.target.value;
                      setParams(newParams);
                    }}
                  />
                </div>
              ))
            }
          </Form.Group>
          { !loadingRequest
              && (
              <Button variant="dark" type="submit">
                Submit
              </Button>
              )}
          { loadingRequest
              && (
              <Stack direction="horizontal" gap={3}>
                <Button disabled variant="dark" type="submit" style={{ opacity: '0.5' }}>
                  Submit
                </Button>
                <Spinner />
              </Stack>
              )}
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default Request;
