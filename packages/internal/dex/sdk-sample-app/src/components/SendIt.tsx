import { Exchange } from '@imtbl/dex-sdk';
import { configuration } from '../config';
import { useState } from 'react';
import { ethers } from 'ethers';

const tokiesToTry = [
  {
    inputToken: '0xb0d4189b8e71e55e4894dbd5d4b39289fc799638',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0x4b84c4f1e4ef05910121e0c009b70b60d1734533',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0x838cc65fa842908e55686488d06aa1497f79220d',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0xee4b5a9c51af73b400ced5e98f8a8a8cdf408b26',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0x903d43fe38cc916fc8187cf966e063830a0f0dbb',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0xb1ab5a5d6f81d6b1968f4b872080afcc9c0d7ae1',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0x22b6d7dc548ff75ec8591ad9c155bf9877c91977',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0xf2af1084a3cc762e6799685c741100e622836b30',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0x6a1d4950fac8e8842cb6157f6a9b453058ca1d5f',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0xb920a833107b78d782d862f284054aad96056c3b',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0xfc7c91fa9fce78eb8d77b3d7f735b82ee6b0d557',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0x9154009e49ee9150c3d118df072baff43a3d5ff1',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0x8e5f14dc91cb254d06df9d0f6c7b4013467ffa37',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0xf67e17860e03f4af49692a3c8626bb8fc25f1805',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0x4aad5410e966f46e6382bfc345b407a85451d53c',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0xb5918893d5c3da5d2c28cd36a0aa43560d3bce1b',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0x4422593d68c5046073b8748ad8fdaca850f1b269',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0x12739A8f1A8035F439092D016DAE19A2874F30d2',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
  {
    inputToken: '0xFEa9FF93DC0C6DC73F8Be009Fe7a22Bb9dcE8A2d',
    outputToken: '0xb95B75B4E4c09F04d5DA6349861BF1b6F163D78c',
  },
];

export const SendIt = ({ ethereumAccount }: { ethereumAccount: string }) => {
  const [results, setResults] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);

  const exchange = new Exchange(configuration);

  const getQuote = async () => {
    setIsFetching(true);
    setError(null);

    try {
      const txnPromises = [];

      for (let i = 0; i < tokiesToTry.length; i++) {
        txnPromises[i] = exchange.getUnsignedSwapTxFromAmountIn(
          ethereumAccount,
          tokiesToTry[i].inputToken,
          tokiesToTry[i].outputToken,
          ethers.utils.parseEther('5')
        );
      }

      setStart(Date.now());
      console.log('fetching at time ', start);

      const quotes = await Promise.all(txnPromises.map(p => p.catch(e => e)));
      const validQUotes = quotes.filter(result => !(result instanceof Error));

      setResults(validQUotes)

      setEnd(Date.now());
      console.log('done fetching at time');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown Error';
      setError(`Error fetching quote: ${message}`);
    }

    setIsFetching(false);
  };

  console.log({ results });

  return (
    <div>
      <button
        className='disabled:opacity-50 mt-2 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75'
        onClick={async () => await getQuote()}
        disabled={isFetching}>
        Get TOKIES
      </button>
      {isFetching && <div>WE ARE FETCHING HELLO...</div>}
      {results.length > 0 && (
        <div>
          <div>WE GOT RESULTS</div>
          <div>It took {(end - start) / 1000} seconds</div>
        </div>
      )}
      {error && <div>{error}</div>}
    </div>
  );
};
