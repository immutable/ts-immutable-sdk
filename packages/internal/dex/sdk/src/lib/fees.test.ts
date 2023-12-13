import { IMX_TEST_TOKEN, WETH_TEST_TOKEN, makeAddr } from 'test/utils';
import { BigNumber } from 'ethers';
import { TradeType } from '@uniswap/sdk-core';
import { Fees } from './fees';

const buildFees = (tradeType = TradeType.EXACT_INPUT) => new Fees(
  [
    {
      basisPoints: 1000, // 10%
      recipient: makeAddr('yeet'),
    },
    {
      basisPoints: 500, // 5%
      recipient: makeAddr('yort'),
    },
  ],
  IMX_TEST_TOKEN,
  tradeType,
);

describe('fees', () => {
  describe('withAmounts', () => {
    describe('for an exact input trade', () => {
      it('returns the fees with their calculated amounts', () => {
        const fees = buildFees(TradeType.EXACT_INPUT);
        fees.addAmount({ token: IMX_TEST_TOKEN, value: BigNumber.from(1000) });
        expect(fees.withAmounts()).toHaveLength(2);
        expect(fees.withAmounts().map((x) => x.amount.value.toString())).toEqual([
          '100',
          '50',
        ]);
      });
    });

    describe('for an exact output trade', () => {
      it('returns the fees with their calculated amounts', () => {
        const fees = buildFees(TradeType.EXACT_OUTPUT);
        fees.addAmount({ token: IMX_TEST_TOKEN, value: BigNumber.from(1000) });
        expect(fees.withAmounts()).toHaveLength(2);
        expect(fees.withAmounts().map((x) => x.amount.value.toString())).toEqual([
          '111',
          '52',
        ]);
      });
    });
  });

  describe('amountWithFeesApplied', () => {
    describe('for an exact input trade', () => {
      it('subtracts the fees to the amount', () => {
        const fees = buildFees(TradeType.EXACT_INPUT);
        fees.addAmount({ token: IMX_TEST_TOKEN, value: BigNumber.from(100) });
        expect(fees.amountWithFeesApplied().value.toString()).toEqual('85'); // 100 - 10 - 5
      });
    });

    describe('for an exact output trade', () => {
      it('adds the fees from the amount', () => {
        const fees = buildFees(TradeType.EXACT_OUTPUT);
        fees.addAmount({ token: IMX_TEST_TOKEN, value: BigNumber.from(100) });
        expect(fees.amountWithFeesApplied().value.toString()).toEqual('116'); // 100 + 11 + 5
      });
    });
  });

  describe('addAmount', () => {
    it('rejects amounts for the wrong token', () => {
      const fees = buildFees();
      expect(() => fees.addAmount({ token: WETH_TEST_TOKEN, value: BigNumber.from(100) })).toThrow('Token mismatch');
    });
  });
});
