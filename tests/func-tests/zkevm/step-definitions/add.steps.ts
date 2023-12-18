import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('features/add.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, (test) => {
  test('add two numbers', ({
    given,
    when,
    then,
  }) => {
    let x: number = 0;
    let y: number = 0;
    let result: number = 0;
    given(/^I have "(.*)"$/, (arg0) => { x = parseInt(arg0, 10); });
    when(/^I add "(.*)"$/, (arg0) => { y = parseInt(arg0, 10); result = x + y; });
    then(/^I should have "(.*)"$/, (arg0) => { expect(result).toBe(parseInt(arg0, 10)); });
  });
});
