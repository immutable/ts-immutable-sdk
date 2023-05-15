import { amountInputValidation } from './amountInputValidations';

describe('amountInPutValidation', () => {
  const validTestCases = ['123.123456', '1.12345', '123456', '123456.0'];
  const invalidTestCases = ['123.1234567', '1.1234567', 'blah'];

  validTestCases.forEach((testCase) => {
    it(`should validate the input:${testCase} as a float number with 6 decimal places`, function () {
      expect(amountInputValidation(testCase)).toBeTruthy(); // true
    });
  });

  invalidTestCases.forEach((testCase) => {
    it(`should invalidate the input:${testCase}`, function () {
      expect(amountInputValidation(testCase)).toBeFalsy(); // false
    });
  });
});
