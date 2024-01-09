import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('features/order.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, (test) => {
  test('creating and fulfilling a listing', ({
    given,
    when,
    then,
    and,
  }) => {
    // let x: number = 0;
    // let y: number = 0;
    // let result: number = 0;
    given(/^I have have a funded offerer account with a minted NFT$/, () => {});
    and(/^I have have a funded fulfiller account$/, () => {});
    when(/^I create a listing$/, () => {});
    then(/^the listing should be active$/, () => {});
    and(/^when I fulfill the listing$/, () => {});
    then(/^the listing should be filled$/, () => {});
    and(/^the NFT should be transferred to the fulfiller$/, () => {});
    and(/^the trade data should be available$/, () => {});
  });
});
