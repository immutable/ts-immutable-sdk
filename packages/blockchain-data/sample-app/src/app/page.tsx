'use client';

import React, { useEffect, useState } from 'react';

import { Environment, ImmutableConfiguration } from '@imtbl/config';
import {
  BlockchainData,
  BlockchainDataModuleConfiguration,
  ChainsTypes,
} from '@imtbl/blockchain-data';
import { PageLayout } from '@/components/PageLayout';
import { capitalizeFirstLetter } from '@/utils';

const endpointDomains = {
  activities: [
    {
      name: 'listActivities',
      paginated: true,
      queryParams: [
        {
          id: 'activity_type',
          label: 'Activity type',
          type: 'select',
          options: [
            {
              name: 'Mint',
              value: 'mint',
            },
            {
              name: 'Transfer',
              value: 'transfer',
            },
            {
              name: 'Burn',
              value: 'burn',
            },
          ],
        },
        {
          id: 'contract_address',
          label: 'Contract address',
          type: 'text',
        },
        {
          id: 'account_address',
          label: 'Account address',
          type: 'text',
        },
        {
          id: 'token_id',
          label: 'Token ID',
          type: 'text',
        },
        {
          id: 'transaction_hash',
          label: 'Transaction hash',
          type: 'text',
        },
      ],
      pathParams: [],
    },
    {
      name: 'getActivity',
      paginated: false,
      queryParams: [],
      pathParams: [
        {
          id: 'activity_id',
          label: 'Activity ID',
          type: 'text',
        },
      ],
    },
  ],
  chains: [
    {
      name: 'listChains',
      paginated: true,
      queryParams: [],
      pathParams: [],
    },
  ],
  collections: [
    {
      name: 'listCollections',
      paginated: true,
      queryParams: [],
      pathParams: [],
    },
    {
      name: 'getCollection',
      paginated: false,
      queryParams: [],
      pathParams: [
        {
          id: 'contract_address',
          label: 'Contract address',
          type: 'text',
        },
      ],
    },
  ],
  nfts: [
    {
      name: 'getNFT',
      paginated: false,
      queryParams: [],
      pathParams: [
        {
          id: 'contract_address',
          label: 'Contract address',
          type: 'text',
        },
        {
          id: 'token_id',
          label: 'Token ID',
          type: 'text',
        },
      ],
    },
    {
      name: 'listNFTs',
      paginated: true,
      queryParams: [],
      pathParams: [
        {
          id: 'contract_address',
          label: 'Contract address',
          type: 'text',
        },
      ],
    },
    {
      name: 'listNFTsByAccountAddress',
      paginated: true,
      queryParams: [
        {
          id: 'contract_address',
          label: 'Contract address',
          type: 'text',
        },
      ],
      pathParams: [
        {
          id: 'account_address',
          label: 'Account address',
          type: 'text',
        },
      ],
    },
  ],
  'nft Owners': [
    {
      name: 'listNFTOwners',
      paginated: true,
      queryParams: [],
      pathParams: [
        {
          id: 'contract_address',
          label: 'Contract address',
          type: 'text',
        },
        {
          id: 'token_id',
          label: 'Token ID',
          type: 'text',
        },
      ],
    },
  ],
};

export default function Home() {
  const [response, setResponse] = useState<ChainsTypes.ListChainsResult | null>(
    null,
  );

  useEffect(() => {
    async function getData() {
      const environment = Environment.SANDBOX;

      const config: BlockchainDataModuleConfiguration = {
        baseConfig: new ImmutableConfiguration({
          environment,
        }),
      };

      const client = new BlockchainData(config);

      try {
        const request: ChainsTypes.ListChainsRequest = {};
        const response = await client.listChains(request);
        setResponse(response);
      } catch (error) {
        console.error(error);
      }
    }

    getData();
  }, []);

  return (
    <PageLayout>
      <div className="lg:mb-0 my-6 flex space-x-6">
        <div className="flex flex-col">
          {Object.keys(endpointDomains).map((key) => {
            const endpoints = endpointDomains[key];
            return (
              <React.Fragment key={key}>
                <h2
                  className={`text-sm uppercase tracking-wider font-mono`}
                  style={{ opacity: 0.6 }}
                >
                  {capitalizeFirstLetter(key)}
                </h2>
                <ul className="my-1">
                  {endpoints.map((endpoint) => (
                    <li className="my-2" key={endpoint.name}>
                      <a
                        href="#"
                        className="group rounded-lg border border-transparent p-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                      >
                        {endpoint.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </React.Fragment>
            );
          })}
        </div>
        <div className="flex-1 bg-gray w-full h-full">
          {response !== null && (
            <pre className="p-4 bg-neutral-800/50 rounded-lg">
              {JSON.stringify(response.result, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
