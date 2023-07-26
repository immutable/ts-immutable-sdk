'use client';

import React, { useEffect, useState } from 'react';

import { Environment, ImmutableConfiguration } from '@imtbl/config';
import {
  BlockchainData,
  BlockchainDataModuleConfiguration,
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
      // buildURL: function (pathValues, queryValues) {
      //   // TODO replace url construction with native methods: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams
      //   let url = `${apiURL}/chains/${chainName}/activities`;

      //   // Apply filters
      //   if (Object.keys(queryValues).length > 0) {
      //     Object.keys(queryValues).map((key) => {
      //       url += `${separator(url)}${key}=${queryValues[key]}`;
      //     });
      //   }

      //   return url;
      // },
      // renderData: function (data) {
      //   console.log("renderData::ListActivities", data);
      //   const loader = document.getElementById("loader");
      //   loader.remove();

      //   const content = document.getElementById("content");

      //   const tableBody = createActivityTable(content);
      //   tableBody.innerHTML = "";

      //   let activities = data.result;
      //   activities_details = {};

      //   activities.forEach(function (result) {
      //     activities_details[result.id] = result.details;
      //     createActivityRow(result, tableBody);
      //   });

      //   new Promise((r) => setTimeout(r, 500)).then(() => {
      //     setupModal();
      //   });
      // },
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
      // buildURL: function (pathValues, queryValues) {
      //   if (!pathValues["activity_id"]) {
      //     throw new Error("Please enter an activity_id");
      //   }
      //   const chainName = "sepolia";
      //   return `https://api.dev.immutable.com/v1/chains/${chainName}/activities/${pathValues["activity_id"]}`;
      // },
      // renderData: function (data) {
      //   console.log("renderData::GetActivityByID", data);
      //   const loader = document.getElementById("loader");
      //   loader.remove();

      //   const content = document.getElementById("content");

      //   const tableBody = createActivityTable(content);
      //   tableBody.innerHTML = "";

      //   const { result } = data;
      //   activities_details = {};
      //   activities_details[result.id] = result.details;

      //   createActivityRow(result, tableBody);

      //   new Promise((r) => setTimeout(r, 500)).then(() => {
      //     setupModal();
      //   });
      // },
    },
  ],
  chains: [
    {
      name: 'listChains',
      paginated: true,
      queryParams: [],
      pathParams: [],
      // buildURL: function (pathValues, queryValues) {
      //   let url = `${apiURL}/chains`;

      //   // Apply filters
      //   if (Object.keys(queryValues).length > 0) {
      //     Object.keys(queryValues).map((key) => {
      //       url += `${separator(url)}${key}=${queryValues[key]}`;
      //     });
      //   }

      //   return url;
      // },
      // renderData: function (data) {
      //   console.log("ListChains", data);
      //   const loader = document.getElementById("loader");
      //   loader.remove();

      //   const content = document.getElementById("content");

      //   const pre = document.createElement("pre");
      //   pre.innerHTML = JSON.stringify(data, null, 2);
      //   content.appendChild(pre);
      // },
    },
  ],
  collections: [
    {
      name: 'listCollections',
      paginated: true,
      queryParams: [],
      pathParams: [],
      // buildURL: function (pathValues, queryValues) {
      //   let url = `${apiURL}/chains/${chainName}/collections`;

      //   // Apply filters
      //   if (Object.keys(queryValues).length > 0) {
      //     Object.keys(queryValues).map((key) => {
      //       url += `${separator(url)}${key}=${queryValues[key]}`;
      //     });
      //   }

      //   return url;
      // },
      // renderData: function (data) {
      //   console.log("ListCollections", data);
      //   const loader = document.getElementById("loader");
      //   loader.remove();

      //   const content = document.getElementById("content");

      //   const pre = document.createElement("pre");
      //   pre.innerHTML = JSON.stringify(data, null, 2);
      //   content.appendChild(pre);
      // },
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
      // buildURL: function (pathValues, queryValues) {
      //   if (!pathValues["contract_address"]) {
      //     throw new Error("Please enter a contract_address");
      //   }

      //   return `${apiURL}/chains/${chainName}/collections/${pathValues["contract_address"]}`;
      // },
      // renderData: function (data) {
      //   console.log("GetCollectionsByAddress", data);
      //   const loader = document.getElementById("loader");
      //   loader.remove();

      //   const content = document.getElementById("content");

      //   const pre = document.createElement("pre");
      //   pre.innerHTML = JSON.stringify(data, null, 2);
      //   content.appendChild(pre);
      // },
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
      // buildURL: function (pathValues, queryValues) {
      //   if (!pathValues["contract_address"]) {
      //     throw new Error("Please enter a contract_address");
      //   }
      //   if (!pathValues["token_id"]) {
      //     throw new Error("Please enter a token_id");
      //   }
      //   const chainName = "sepolia";
      //   return `https://api.dev.immutable.com/v1/chains/${chainName}/collections/${pathValues["contract_address"]}/nfts/${pathValues["token_id"]}`;
      // },
      // renderData: function (data) {
      //   console.log("GetNFTByTokenID", data);
      //   const loader = document.getElementById("loader");
      //   loader.remove();

      //   const content = document.getElementById("content");

      //   const pre = document.createElement("pre");
      //   pre.innerHTML = JSON.stringify(data, null, 2);
      //   content.appendChild(pre);
      // },
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
      // buildURL: function (pathValues, queryValues) {
      //   if (!pathValues["contract_address"]) {
      //     throw new Error("Please enter a contract_address");
      //   }

      //   let url = `${apiURL}/chains/${chainName}/collections/${pathValues["contract_address"]}/nfts`;

      //   // Apply filters
      //   if (Object.keys(queryValues).length > 0) {
      //     Object.keys(queryValues).map((key) => {
      //       url += `${separator(url)}${key}=${queryValues[key]}`;
      //     });
      //   }

      //   return url;
      // },
      // renderData: function (data) {
      //   console.log("ListNFTsByContractAddress", data);
      //   const loader = document.getElementById("loader");
      //   loader.remove();

      //   const content = document.getElementById("content");

      //   const pre = document.createElement("pre");
      //   pre.innerHTML = JSON.stringify(data, null, 2);
      //   content.appendChild(pre);
      // },
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
      // buildURL: function (pathValues, queryValues) {
      //   if (!pathValues["account_address"]) {
      //     throw new Error("Please enter an account_address");
      //   }

      //   let url = `${apiURL}/chains/${chainName}/accounts/${pathValues["account_address"]}/nfts`;

      //   // Apply filters
      //   const separator = function () {
      //     return url.includes("?") ? "&" : "?";
      //   };

      //   if (Object.keys(queryValues).length > 0) {
      //     Object.keys(queryValues).map((key) => {
      //       url += `${separator()}${key}=${queryValues[key]}`;
      //     });
      //   }

      //   return url;
      // },
      // renderData: function (data) {
      //   console.log("ListNFTsByAccountAddress", data);
      //   const loader = document.getElementById("loader");
      //   loader.remove();

      //   const content = document.getElementById("content");

      //   const pre = document.createElement("pre");
      //   pre.innerHTML = JSON.stringify(data, null, 2);
      //   content.appendChild(pre);
      // },
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
      // buildURL: function (pathValues, queryValues) {
      //   if (!pathValues["contract_address"]) {
      //     throw new Error("Please enter a contract_address");
      //   }
      //   if (!pathValues["token_id"]) {
      //     throw new Error("Please enter a token_id");
      //   }

      //   let url = `${apiURL}/chains/${chainName}/collections/${pathValues["contract_address"]}/nfts/${pathValues["token_id"]}/owners`;

      //   // Apply filters
      //   if (Object.keys(queryValues).length > 0) {
      //     Object.keys(queryValues).map((key) => {
      //       url += `${separator(url)}${key}=${queryValues[key]}`;
      //     });
      //   }

      //   return url;
      // },
      // renderData: function (data) {
      //   console.log("ListOwnersByTokenID", data);
      //   const loader = document.getElementById("loader");
      //   loader.remove();

      //   const content = document.getElementById("content");

      //   const pre = document.createElement("pre");
      //   pre.innerHTML = JSON.stringify(data, null, 2);
      //   content.appendChild(pre);
      // },
    },
  ],
};

export default function Home() {
  const [response, setResponse] = useState('');

  useEffect(() => {
    async function getData() {
      const environment = Environment.SANDBOX;

      const API_URL = 'https://api.dev.immutable.com';

      const config: BlockchainDataModuleConfiguration = {
        baseConfig: new ImmutableConfiguration({
          environment,
        }),
        overrides: {
          basePath: API_URL,
        },
      };

      const client = new BlockchainData(config);

      try {
        const response = await client.listChains();
        setResponse(response.result);
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
          <pre className="p-4 bg-neutral-800/50 rounded-lg">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      </div>
    </PageLayout>
  );
}
