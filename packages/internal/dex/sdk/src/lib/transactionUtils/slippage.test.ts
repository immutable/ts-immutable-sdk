import { slippageToFraction } from './slippage';

describe('slippageToPercent', () => {
  describe('when given a whole number', () => {
    it('returns that number as a Percent type', () => {
      const caseOne = slippageToFraction(1);
      const caseTwo = slippageToFraction(10);
      const caseThree = slippageToFraction(100);
      const caseFour = slippageToFraction(1000);

      expect(caseOne.toSignificant()).toEqual('1');
      expect(caseOne.numerator.toString()).toEqual('1');
      expect(caseOne.denominator.toString()).toEqual('100');

      expect(caseTwo.toSignificant()).toEqual('10');
      expect(caseTwo.numerator.toString()).toEqual('10');
      expect(caseTwo.denominator.toString()).toEqual('100');

      expect(caseThree.toSignificant()).toEqual('100');
      expect(caseThree.numerator.toString()).toEqual('100');
      expect(caseThree.denominator.toString()).toEqual('100');

      expect(caseFour.toSignificant()).toEqual('1000');
      expect(caseFour.numerator.toString()).toEqual('1000');
      expect(caseFour.denominator.toString()).toEqual('100');
    });
  });

  describe('when given a fraction', () => {
    it('returns that number as a Percent type', () => {
      const caseOne = slippageToFraction(0.1);
      const caseTwo = slippageToFraction(0.01);
      const caseThree = slippageToFraction(0.001);
      const caseFour = slippageToFraction(0.0001);

      expect(caseOne.toSignificant()).toEqual('0.1');
      expect(caseOne.numerator.toString()).toEqual('1');
      expect(caseOne.denominator.toString()).toEqual('1000');

      expect(caseTwo.toSignificant()).toEqual('0.01');
      expect(caseTwo.numerator.toString()).toEqual('1');
      expect(caseTwo.denominator.toString()).toEqual('10000');

      expect(caseThree.toSignificant()).toEqual('0.001');
      expect(caseThree.numerator.toString()).toEqual('1');
      expect(caseThree.denominator.toString()).toEqual('100000');

      expect(caseFour.toSignificant()).toEqual('0.0001');
      expect(caseFour.numerator.toString()).toEqual('1');
      expect(caseFour.denominator.toString()).toEqual('1000000');
    });
  });

  describe('when given a negative number', () => {
    it('returns that number as a Percent type', () => {
      const caseOne = slippageToFraction(-0.1);

      expect(caseOne.toSignificant()).toEqual('-0.1');
      expect(caseOne.numerator.toString()).toEqual('-1');
      expect(caseOne.denominator.toString()).toEqual('1000');
    });
  });
});
