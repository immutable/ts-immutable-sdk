'use client';

import React, { useEffect, useState } from 'react';

import { Environment, ImmutableConfiguration } from '@imtbl/config';
import {
  BlockchainData,
  BlockchainDataModuleConfiguration,
  ChainsTypes,
  Types,
  ActivityType,
} from '@imtbl/blockchain-data';
import { PageLayout } from '@/components/PageLayout';

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
        const request: Types.ListChainsResult = {};
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
