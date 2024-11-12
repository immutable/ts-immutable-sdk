import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { Accordion, Form } from 'react-bootstrap';
import { usePassportProvider } from '@/context/PassportProvider';
import WorkflowButton from '@/components/WorkflowButton';
import { RequestExampleProps, EnvironmentNames } from '@/types';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { Interface } from 'ethers';

enum ApproveType {
  NFTApprove = 'NFT_APPROVE',
  NFTApprovalForAll = 'NFT_APPROVAL_FOR_ALL',
}

const getErc721DefaultContractAddress = (environment: EnvironmentNames) => {
  switch (environment) {
    case EnvironmentNames.SANDBOX:
      return '0xbe499b1eaa5c9992486be90ad3a3a4c15dcdfcda';
    case EnvironmentNames.PRODUCTION:
      return '0xb7d76448b0e887ce731e8d17c97ad605df412fb0';
    case EnvironmentNames.DEV:
      return '0xeb091bd8946833d6103baebbfd076a82878bd4e4';
    default:
      return '';
  }
};

function NFTApproval({ disabled, handleExampleSubmitted }: RequestExampleProps) {
  const { environment } = useImmutableProvider();
  const nftApproveContract = useMemo(() => {
    const abi = [
      'function setApprovalForAll(address to, bool approved)',
      'function approve(address to, uint256 tokenId)',
    ];
    return new Interface(abi);
  }, []);

  const [choosedApproveType, setChoosedApproveType] = useState<ApproveType>(ApproveType.NFTApprove);
  const [fromAddress, setFromAddress] = useState<string>('');
  const [erc721ContractAddress, setErc721ContractAddress] = useState<string>(
    getErc721DefaultContractAddress(environment),
  );
  const [toAddress, setToAddress] = useState<string>();
  const [tokenId, setTokenId] = useState<string>('1');
  const [params, setParams] = useState<any[]>([]);

  const [isUnSafe, setIsUnSafe] = useState<boolean>(false);
  const { zkEvmProvider } = usePassportProvider();

  const handleSetApproveType = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setChoosedApproveType(e.target.value as ApproveType);
  }, []);
  const sixteenNativeToken = '16000000000000000000';

  useEffect(() => {
    const nftTokenId = tokenId.trim() === '' ? '1' : tokenId;
    try {
      const data = choosedApproveType === ApproveType.NFTApprove
        ? nftApproveContract.encodeFunctionData('approve', [toAddress, nftTokenId])
        : nftApproveContract.encodeFunctionData('setApprovalForAll', [toAddress, true]);
      const transferAmount = isUnSafe ? sixteenNativeToken : '0';
      setParams([{
        from: fromAddress,
        to: erc721ContractAddress,
        value: transferAmount,
        data,
      }]);
    } catch (err) {
      setParams([{
        from: fromAddress,
        to: erc721ContractAddress,
        value: '0',
        data: '0x',
      }]);
    }
  }, [fromAddress, erc721ContractAddress, toAddress, tokenId, choosedApproveType, nftApproveContract, isUnSafe]);

  useEffect(() => {
    const getAddress = async () => {
      if (zkEvmProvider) {
        const [walletAddress] = await zkEvmProvider.request({
          method: 'eth_requestAccounts',
        });
        setFromAddress(walletAddress || '');
      }
    };

    getAddress().catch(console.log);
  }, [zkEvmProvider, setFromAddress]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    await handleExampleSubmitted({
      method: 'eth_sendTransaction',
      params,
    });
  }, [params, handleExampleSubmitted]);

  return (
    <Accordion.Item eventKey="4">
      <Accordion.Header>NFT Approve</Accordion.Header>
      <Accordion.Body>
        <Form onSubmit={handleSubmit} className="mb-4">
          <Form.Group className="mb-3">
            <Form.Label>
              Preview
            </Form.Label>
            <Form.Control
              readOnly
              as="textarea"
              rows={7}
              value={JSON.stringify(params, null, '\t')}
              style={{
                fontSize: '0.8rem',
              }}
            />
          </Form.Group>
          <Form.Label>Token Type</Form.Label>
          <Form.Select onChange={handleSetApproveType}>
            <option value={ApproveType.NFTApprove}>NFT Approve</option>
            <option value={ApproveType.NFTApprovalForAll}>NFT Batch Approve</option>
          </Form.Select>
          <Form.Group className="mb-3">
            <Form.Label>
              From
            </Form.Label>
            <Form.Control
              required
              disabled
              type="text"
              placeholder="From Address"
              value={fromAddress}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              {choosedApproveType === ApproveType.NFTApprove
                ? 'ERC721 Contract Address'
                : 'ERC721 / ERC1155 Contract Address'}
            </Form.Label>
            <Form.Control
              required
              disabled={disabled}
              type="text"
              value={erc721ContractAddress}
              onChange={(e) => setErc721ContractAddress(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>
              To Address
            </Form.Label>
            <Form.Control
              required
              disabled={disabled}
              type="text"
              placeholder="To Address"
              onChange={(e) => setToAddress(e.target.value)}
              value={toAddress}
            />
          </Form.Group>
          {choosedApproveType === ApproveType.NFTApprove && (
            <Form.Group className="mb-3">
              <Form.Label>
                Token Id
              </Form.Label>
              <Form.Control
                required
                type="number"
                disabled={disabled}
                onChange={(e) => setTokenId(e.target.value)}
                value={tokenId}
              />
            </Form.Group>
          )}
          <Form.Check
            onClick={() => { setIsUnSafe(!isUnSafe); }}
            type="checkbox"
            id="check-is-unsafe"
            label="is Unsafe?"
          />
          <WorkflowButton
            disabled={disabled}
            type="submit"
          >
            Submit
          </WorkflowButton>
        </Form>
      </Accordion.Body>
    </Accordion.Item>
  );
}

export default NFTApproval;
