import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('features/add.feature');

defineFeature(feature, (test) => {
  test('Addition', ({ given, when, then }) => {
    let x:number;
    let y:number;
    let result:number;

    given(/^I have the number "(.*)"$/, (givenX) => {
      x = Number(givenX);
    });

    when(/^I add "(.*)"$/, (givenY) => {
      result = x + Number(givenY);
    });

    then(/^I should have "(.*)"$/, (want) => {
      expect(result).toBe(Number(want));
    });
  });
});
