import { utils } from 'ethers';
import React, { useEffect, useState } from 'react';
import {
  Alert, Button, Form, Image, Offcanvas, Spinner, Stack, Table,
} from 'react-bootstrap';
import { Heading } from '@biom3/react';
import { Asset, UnsignedTransferRequest } from '@imtbl/core-sdk';
import { TransferProps } from '@/types';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { useStatusProvider } from '@/context/StatusProvider';
import { usePassportProvider } from '@/context/PassportProvider';

enum TokenType {
  ERC721Token = 'ERC721',
  ERC20Token = 'ERC20',
  ETHToken = 'ETH',
}

function Transfer({ showTransfer, setShowTransfer }: TransferProps) {
  const [token, setToken] = useState<TokenType>(TokenType.ERC721Token);
  const [receiver, setReceiver] = useState<string>('');
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [tokenId, setTokenId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isInvalid, setInvalid] = useState<boolean | undefined>(undefined);
  const [loadingTransfer, setLoadingTransfer] = useState<boolean>(false);
  const [loadingAssets, setLoadingAssets] = useState<boolean>(false);
  const [assets, setAssets] = useState<Asset[]>([]);

  const { setMessage } = useStatusProvider();
  const { imxProvider, imxWalletAddress } = usePassportProvider();
  const { coreSdkClient } = useImmutableProvider();

  useEffect(() => {
    setLoadingAssets(true);
    const getAssets = async () => {
      const result = await coreSdkClient.listAssets({ user: imxWalletAddress });
      setAssets(result.result);
      setLoadingAssets(false);
    };
    getAssets().catch(console.log);
  }, [coreSdkClient, imxWalletAddress]);

  useEffect(() => {
    (async () => {
      setLoadingAssets(true);
      if (showTransfer) {
        setAssets([]);

        const result = await coreSdkClient.listAssets({ user: imxWalletAddress });
        setAssets(result.result);
        setLoadingAssets(false);
      }
    })();
  }, [showTransfer, coreSdkClient, imxWalletAddress]);

  const resetForm = () => {
    setToken(TokenType.ERC721Token);
    setReceiver('');
    setTokenAddress('');
    setTokenId('');
    setAmount('');
    setInvalid(false);
  };

  const handleClose = () => {
    resetForm();
    setLoadingTransfer(false);
    setShowTransfer(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const form = e.currentTarget;
    if (form.checkValidity()) {
      setInvalid(false);
      setLoadingTransfer(true);
      try {
        let request: UnsignedTransferRequest;
        switch (token) {
          case TokenType.ERC721Token: {
            request = {
              type: TokenType.ERC721Token,
              tokenId,
              tokenAddress,
              receiver,
            };
            break;
          }
          case TokenType.ERC20Token: {
            request = {
              type: TokenType.ERC20Token,
              tokenAddress,
              amount,
              receiver,
            };
            break;
          }
          case TokenType.ETHToken: {
            request = {
              type: TokenType.ETHToken,
              amount: utils.parseEther(amount).toString(),
              receiver,
            };
            break;
          }
          default: {
            setMessage('Invalid token type');
            handleClose();
            return;
          }
        }
        const transferResponse = await imxProvider?.transfer(request);
        if (transferResponse) {
          setLoadingTransfer(false);
          if (amount) {
            setMessage(`Transferred ${token} ${amount} to  ${receiver}`);
          } else {
            setMessage(`Transferred to ${receiver}`);
          }
          handleClose();
        }
      } catch (err) {
        if (err instanceof Error) {
          setMessage(err.toString());
          handleClose();
        }
      }
    } else {
      setInvalid(true);
    }
  };

  const handleSetToken = (e: React.ChangeEvent<HTMLSelectElement>) => {
    resetForm();
    setToken(e.target.value as TokenType);
  };

  return (
    <Offcanvas
      show={showTransfer}
      onHide={handleClose}
      backdrop="static"
      placement="end"
      style={{ width: '35%' }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title><Heading>Transfer</Heading></Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form noValidate validated={isInvalid} onSubmit={handleSubmit} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>Token Type</Form.Label>
            <Form.Select onChange={handleSetToken}>
              <option value={TokenType.ERC721Token}>ERC721</option>
              <option value={TokenType.ERC20Token}>ERC20</option>
              <option value={TokenType.ETHToken}>ETH</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              Receiver
              <span style={{ color: 'red' }}> *</span>
            </Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="Add receiver's wallet address"
              onChange={(e) => {
                setReceiver(e.target.value);
              }}
            />
            <Form.Control.Feedback type="invalid">
              Receiver is required
            </Form.Control.Feedback>
          </Form.Group>
          { (token === TokenType.ERC721Token || token === TokenType.ERC20Token)
              && (
              <Form.Group className="mb-3">
                <Form.Label>
                  Token Address
                  <span style={{ color: 'red' }}> *</span>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="e.g. 0xacb3c6a43d15b907e8433077b6d38ae40936fe2c"
                  onChange={(e) => setTokenAddress(e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  Token Address is required
                </Form.Control.Feedback>
              </Form.Group>
              )}
          { token === TokenType.ERC721Token
              && (
              <Form.Group className="mb-3">
                <Form.Label>
                  Token ID
                  <span style={{ color: 'red' }}> *</span>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="e.g. 1234"
                  onChange={(e) => setTokenId(e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  Token ID is required
                </Form.Control.Feedback>
              </Form.Group>
              )}
          { (token === TokenType.ERC20Token || token === TokenType.ETHToken)
              && (
              <Form.Group className="mb-3">
                <Form.Label>
                  Amount
                  <span style={{ color: 'red' }}> *</span>
                </Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="e.g. 1"
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Form.Control.Feedback type="invalid">
                  Amount is required
                </Form.Control.Feedback>
              </Form.Group>
              )}
          { !loadingTransfer
              && (
              <Button variant="dark" type="submit">
                Submit
              </Button>
              )}
          { loadingTransfer
              && (
              <Stack direction="horizontal" gap={3}>
                <Button disabled variant="dark" type="submit" style={{ opacity: '0.5' }}>
                  Submit
                </Button>
                <Spinner />
              </Stack>
              )}
        </Form>
        { (token === TokenType.ERC721Token && !loadingAssets && assets.length > 0)
            && (
            <>
              <hr />
              <Heading size="small">Your Assets</Heading>
              <Table striped bordered hover responsive className="mt-2">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Image</th>
                    <th>Token Address</th>
                    <th>Token ID</th>
                  </tr>
                </thead>
                <tbody>
                  {
                      assets?.map((asset, index) => (
                        <tr key={asset.token_id}>
                          <td>{ index }</td>
                          <td>{ asset.name }</td>
                          <td>
                            <Image
                              src={asset.image_url || undefined}
                              alt={asset.name || ''}
                              width="150"
                              height="150"
                              thumbnail
                            />
                          </td>
                          <td style={{ wordBreak: 'break-all' }}>{ asset.token_address }</td>
                          <td style={{ wordBreak: 'break-all' }}>{ asset.token_id }</td>
                        </tr>
                      ))
}
                </tbody>
              </Table>
            </>
            )}
        { (token === TokenType.ERC721Token && !loadingAssets && assets?.length === 0)
            && <Alert variant="info">You have no assets available to transfer</Alert>}
        {
          (token === TokenType.ERC721Token && loadingAssets)
            && <Spinner />
        }
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default Transfer;
