import { IMX_TEST_TOKEN, WETH_TEST_TOKEN, makeAddr } from '../test/utils';
import { Fees } from './fees';

const buildFees = () => new Fees(
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
);

describe('fees', () => {
  describe('withAmounts', () => {
    it('returns the fees with their calculated amounts', () => {
      const fees = buildFees();
      fees.addAmount({ token: IMX_TEST_TOKEN, value: BigInt(100) });
      expect(fees.withAmounts()).toHaveLength(2);
      expect(fees.withAmounts().map((x) => x.amount.value.toString())).toEqual([
        '10',
        '5',
      ]);
    });
  });

  describe('amountWithFeesApplied', () => {
    it('applies the fees to the amount', () => {
      const fees = buildFees();
      fees.addAmount({ token: IMX_TEST_TOKEN, value: BigInt(100) });
      expect(fees.amountWithFeesApplied().value.toString()).toEqual('115'); // 100 + 10 + 5
    });
  });

  describe('amountLessFees', () => {
    it('applies the fees to the amount', () => {
      const fees = buildFees();
      fees.addAmount({ token: IMX_TEST_TOKEN, value: BigInt(100) });
      expect(fees.amountLessFees().value.toString()).toEqual('85'); // 100 - 10 - 5
    });
  });

  describe('addAmount', () => {
    it('rejects amounts for the wrong token', () => {
      const fees = buildFees();
      expect(() => fees.addAmount({ token: WETH_TEST_TOKEN, value: BigInt(100) })).toThrow('Token mismatch');
    });
  });
});
