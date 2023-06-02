'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import { Environment, ImmutableConfiguration } from '@imtbl/config';
import {
  BlockchainData,
  BlockchainDataModuleConfiguration,
} from '@imtbl/blockchain-data';

import { Wallet } from '@ethersproject/wallet';
import { getDefaultProvider } from '@ethersproject/providers';
import { ERC20 as OpenZeppelinERC20, ERC20__factory as OpenZeppelinERC20Factory } from '@imtbl/contracts';

import { ERC20 } from '@imtbl/erc20';

const chainName = 'sepolia';
const apiURL = 'https://indexer-mr.dev.imtbl.com/v1';

const separator = (url: string) => (url.includes('?') ? '&' : '?');

const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

const endpointDomains = {
  activities: [
    {
      name: 'ListActivities',
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
      name: 'GetActivityByID',
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
      //   return `https://indexer-mr.dev.imtbl.com/v1/chains/${chainName}/activities/${pathValues["activity_id"]}`;
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
      name: 'ListChains',
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
      name: 'ListCollections',
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
      name: 'GetCollectionByAddress',
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
      name: 'GetNFTByTokenID',
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
      //   return `https://indexer-mr.dev.imtbl.com/v1/chains/${chainName}/collections/${pathValues["contract_address"]}/nfts/${pathValues["token_id"]}`;
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
      name: 'ListNFTsByContractAddress',
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
      name: 'ListNFTsByAccountAddress',
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
      name: 'ListOwnersByTokenID',
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

  // @ts-ignore
  useEffect(() => {
    async function getData() {
      const environment = Environment.SANDBOX;

      const e = new ERC20('0x53844F9577C2334e541Aec7Df7174ECe5dF1fCf0');
      // @ts-ignore
      //const supply = await e.contract.totalSupply()
      //console.log('supply is: ', supply)

      // @ts-ignore
      // await e.totalSupply(null)
      // await e.totalSupply()
      console.log('c');
     //const sup = await e.supply()
      //console.log('sup ', sup);

      const provider = getDefaultProvider("sepolia")
      const pk = '30e0fcc32ee0cbee6002a152389937a3719c33c8e1e28b8253112604fdadbb69'
      const w = new Wallet(pk)//.connect(provider)

      // @ts-ignore
      //await e.contract.totalSupply()

      // @ts-ignore
     // const newE = e.contract.connect(w)
      // @ts-ignore
      //const supply = await newE.totalSupply()

      //console.log('supply after connect is: ', supply) w.address

      // @ts-ignore
      //const r = await e.contract.populateTransaction.totalSupply(undefined); //fails [undefined]
      // @ts-ignore
      const r1 = await e.contract.populateTransaction.totalSupply(null); //works
      // @ts-ignore
      const r2 = await e.contract.populateTransaction.totalSupply({
        gasPrice: 1,
      }); //works
      // @ts-ignore
      ///const r2 = await e.contract.populateTransaction.totalSupply(); //works //...args []

      // @ts-ignore
      const factory = new OpenZeppelinERC20Factory();
      const newErc20 = await factory.attach("0x53844F9577C2334e541Aec7Df7174ECe5dF1fCf0")

      // in read function
      const yetAnotherERC20 = newErc20.connect(provider)

      yetAnotherERC20.balanceOf("0x4c00cB23d75530798593593401d977BFA04bd321").then(e => console.log('balanceOf - newErc20 !!!!, ', e.toString())).catch(e => console.log('fail, ', e))
      newErc20.balanceOf("0x4c00cB23d75530798593593401d977BFA04bd321").then(e => console.log('balanceOf!!!!, ', e.toString())).catch(e => console.log('fail, sad face ', e))


      console.log(r1)
      //const sendTransactionResponse = await w.sendTransaction(r1)
      //console.log('response data: ', sendTransactionResponse.data)



      // const st = await w.sendTransaction(r1)
      // console.log(st)
      // console.log('tx hash: ', st.hash)
      // console.log('tx result: ', st)

      // @ts-ignore
      //const tsup = await e.contract.totalSupply();
      //console.log('tsup: ', tsup)


      const config: BlockchainDataModuleConfiguration = {
        baseConfig: new ImmutableConfiguration({
          environment,
        }),
      };

      const client = new BlockchainData(config);

      const request = {
        chainName: 'imtbl-zkevm-testnet',
      };

      const response = await client.listActivities(request);
    }

    getData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <Image
          src="https://assets-global.website-files.com/646557ee455c3e16e4a9bcb3/646557ee455c3e16e4a9bcbe_immutable-logo.svg"
          alt="Vercel Logo"
          className="dark:invert"
          width={190}
          height={48}
          priority
        />
      </div>

      <div className="mb-32 lg:mb-0 flex flex-col my-6">
        {Object.keys(endpointDomains).map((key) => {
          const endpoints = endpointDomains[key];
          return (
            <>
              <h2
                className="text-sm uppercase tracking-wider font-mono"
                style={{ opacity: 0.6 }}
              >
                {capitalizeFirstLetter(key)}
              </h2>
              <ul className="my-1">
                {endpoints.map((endpoint) => (
                  <li className="my-2">
                    <a
                      href="#"
                      className="group rounded-lg border border-transparent p-2 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                    >
                      {endpoint.name}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          );
        })}
        <div className="flex-1 bg-gray w-full h-full" />
      </div>
    </main>
  );
}
