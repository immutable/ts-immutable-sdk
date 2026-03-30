import { defineFeature, loadFeature } from 'jest-cucumber';
import { Registration } from './registration';
import { StepSharedState } from './stepSharedState';

const feature = loadFeature('features/registration.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, (test) => {
  test('Registration', ({ given, and, then }) => {
    const sharedState = new StepSharedState();
    const registration = new Registration(sharedState);
    given(/^A new Eth wallet "(.*)"$/, async (addressVar) => {
      await registration.addNewWallet(addressVar);
    });
    and(/^"(.*)" is registered$/, async (addressVar) => {
      await registration.register(addressVar);
    });
    // given(/^banker is registered$/, () => {
    //   registration.registerBanker();
    // });
    then(/^user "(.*)" should be available through api$/, async (addressVar) => {
      await registration.checkUserRegistrationOffchain(addressVar);
    });
  });
});
