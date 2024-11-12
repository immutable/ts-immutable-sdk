import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import {
  Accordion, Form, Image, Table,
} from 'react-bootstrap';
import { EnvironmentNames, RequestExampleProps } from '@/types';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { usePassportProvider } from '@/context/PassportProvider';
import { BlockchainData } from '@imtbl/generated-clients';
import WorkflowButton from '@/components/WorkflowButton';
import { Interface } from 'ethers';

type GroupedAsset = {
  contract_address: string;
  assets: NFTCandidate[];
};

type NFTCandidate = BlockchainData.NFTWithBalance & {
  selected: boolean;
  to_address?: string;
  to_address_required?: string;
};

const chainNameMapping = (environment: EnvironmentNames) => {
  switch (environment) {
    case EnvironmentNames.SANDBOX:
      return 'imtbl-zkevm-testnet';
    case EnvironmentNames.PRODUCTION:
      return 'imtbl-zkevm-mainnet';
    case EnvironmentNames.DEV:
      return 'imtbl-zkevm-devnet';
    default:
      return '';
  }
};

function NFTTransfer({ disabled, handleExampleSubmitted }: RequestExampleProps) {
  const [assets, setAssets] = useState<BlockchainData.NFTWithBalance[]>([]);
  const [transfers, setTransfers] = useState<Partial<NFTCandidate>[]>([]);
  const [fromAddress, setFromAddress] = useState<string>('');
  const { zkEvmProvider } = usePassportProvider();
  const { environment } = useImmutableProvider();
  const [choosedCollection, setChoosedCollection] = useState<GroupedAsset>({ assets: [] } as unknown as GroupedAsset);
  const { blockchainData } = useImmutableProvider();
  const [params, setParams] = useState<any[]>([]);

  const nftTransferContract = useMemo(() => {
    const abi = [
      'function safeTransferFrom(address from, address to, uint256 token_id)',
      'function safeTransferFromBatch((address, address[], uint256[]))',
    ];
    return new Interface(abi);
  }, []);

  useEffect(() => {
    try {
      let data = '0x';
      if (transfers.length > 1) {
        const toAddresses = transfers.map((transfer) => transfer?.to_address);
        const nftTokenIds = transfers.map((transfer) => transfer.token_id);
        data = nftTransferContract.encodeFunctionData(
          'safeTransferFromBatch',
          [[fromAddress, toAddresses, nftTokenIds]],
        );
      }
      if (transfers.length === 1) {
        const toAddresses = transfers[0].to_address;
        const nftTokenId = transfers[0].token_id;
        data = nftTransferContract.encodeFunctionData(
          'safeTransferFrom',
          [fromAddress, toAddresses, nftTokenId],
        );
      }
      setParams([{
        from: fromAddress,
        to: choosedCollection.contract_address,
        value: 0,
        data,
      }]);
    } catch (err) {
      setParams([{
        from: fromAddress,
        to: choosedCollection.contract_address,
        value: '0',
        data: '0x',
      }]);
    }
  }, [fromAddress, choosedCollection.contract_address, transfers, nftTransferContract]);

  const chainName = useMemo(() => chainNameMapping(environment), [environment]);
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

  useEffect(() => {
    const getAssets = async () => {
      if (!fromAddress) return;
      const payload = {
        accountAddress: fromAddress,
        chainName,
      };
      const assetsRes = await blockchainData.listNFTsByAccountAddress(payload);

      setAssets(assetsRes.result as BlockchainData.NFTWithBalance[]);
    };
    getAssets().catch(console.log);
  }, [blockchainData, chainName, fromAddress]);

  const groupedAssets = useMemo(
    () => assets
      .reduce((group: GroupedAsset[], rawAsset: BlockchainData.NFTWithBalance) => {
        const sameContractAddressAssets = group.find(
          (g) => g.contract_address.toLowerCase() === rawAsset.contract_address.toLowerCase(),
        );
        if (!sameContractAddressAssets) {
          return [...group, {
            contract_address: rawAsset.contract_address,
            assets: [{ ...rawAsset, selected: false }],
          }];
        }
        sameContractAddressAssets.assets.push({ ...rawAsset, selected: false });
        return group;
      }, []),
    [assets],
  );

  const updateAssetToAddress = useCallback((choosedAsset: NFTCandidate, toAddress: string) => {
    if (!choosedCollection) return;
    const asset = choosedCollection.assets.find((a: NFTCandidate) => a.token_id === choosedAsset.token_id);
    const otherAsset = choosedCollection.assets
      .filter((a: NFTCandidate) => (a.token_id !== choosedAsset.token_id));
    if (!asset) return;
    asset.to_address = toAddress;
    setChoosedCollection({
      assets: [...otherAsset, asset],
      contract_address: asset.contract_address,
    });
  }, [choosedCollection]);

  const changedTransferCandidate = useCallback((choosedAsset: NFTCandidate) => {
    if (!choosedCollection) return;
    const asset = choosedCollection.assets
      .find((a: NFTCandidate) => a.token_id === choosedAsset.token_id);
    const otherAsset = choosedCollection.assets
      .filter((a: NFTCandidate) => (a.token_id !== choosedAsset.token_id));
    if (!asset) return;
    if (choosedAsset.to_address === undefined || choosedAsset.to_address === '') {
      asset.to_address_required = 'To Address is required';
      setChoosedCollection({
        assets: [...otherAsset, asset],
        contract_address: choosedCollection.contract_address,
      });
      return;
    }
    asset.selected = !asset.selected;
    asset.to_address_required = undefined;
    setChoosedCollection({
      assets: [...otherAsset, asset],
      contract_address: choosedCollection.contract_address,
    });
    if (asset.selected) {
      setTransfers([
        ...transfers,
        asset,
      ]);
    } else {
      setTransfers(transfers.filter((transfer) => (transfer.token_id !== asset.token_id)));
    }
  }, [choosedCollection, transfers]);

  useEffect(() => {
    if (groupedAssets && groupedAssets.length > 0) {
      setChoosedCollection(groupedAssets[0]);
    }
  }, [groupedAssets]);

  const handleSetCollection = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCollect = groupedAssets.find((asset) => asset.contract_address === e.target.value);
    if (!selectedCollect) return;
    setChoosedCollection(selectedCollect);
    setTransfers([]);
  }, [groupedAssets]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    await handleExampleSubmitted({
      method: 'eth_sendTransaction',
      params,
    });
  }, [params, handleExampleSubmitted]);

  return (
    <Accordion.Item eventKey="5">
      <Accordion.Header>NFT Transfer</Accordion.Header>
      <Accordion.Body>
        <Form noValidate onSubmit={handleSubmit} className="mb-4">
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
              Select NFT Collection
            </Form.Label>
            <Form.Select onChange={handleSetCollection}>
              {groupedAssets.map((groupedAsset) => (
                <option
                  key={groupedAsset.contract_address}
                  value={groupedAsset.contract_address}
                >
                  {groupedAsset.contract_address}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          {choosedCollection && (
          <Table striped bordered hover responsive className="mt-2">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Image</th>
                <th>Token Address</th>
                <th>Token ID</th>
                <th>Transfering to Address</th>
                <th>Add to Transfer</th>
              </tr>
            </thead>
            <tbody>
              {
                choosedCollection.assets.map((asset, index) => (
                  <tr key={`${asset.contract_address} - ${asset.token_id}`}>
                    <td>{index}</td>
                    <td>{asset.name}</td>
                    <td>
                      <Image
                        src={asset.image || undefined}
                        alt={asset.name || ''}
                        width="150"
                        height="150"
                        thumbnail
                      />
                    </td>
                    <td style={{ wordBreak: 'break-all' }}>{asset.to_address_required}</td>
                    <td style={{ wordBreak: 'break-all' }}>{asset.token_id}</td>
                    <td style={{ wordBreak: 'break-all' }}>
                      <InputGroup hasValidation>
                        <Form.Control
                          disabled={asset.selected}
                          type="text"
                          placeholder="Transfering To Address"
                          isValid={!asset.to_address_required && !!asset.to_address}
                          isInvalid={!!asset.to_address_required}
                          onChange={(event) => updateAssetToAddress(asset, event.target.value)}
                          value={asset.to_address || ''}
                        />
                        <Form.Control.Feedback type="invalid" tooltip>
                          {asset.to_address_required}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </td>
                    <td style={{ wordBreak: 'break-all' }}>
                      <Form.Check
                        onChange={() => changedTransferCandidate(asset)}
                        type="checkbox"
                        id={`nft-${asset.contract_address}-${asset.token_id}`}
                        checked={asset.selected}
                      />
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
          )}
          <WorkflowButton type="submit" disabled={disabled && transfers.length === 0}>
            Submit
          </WorkflowButton>
        </Form>
      </Accordion.Body>
    </Accordion.Item>
  );
}

export default NFTTransfer;
