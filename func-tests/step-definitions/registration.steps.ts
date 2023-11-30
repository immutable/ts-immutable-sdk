import { defineFeature, loadFeature } from 'jest-cucumber';
import { Registration } from './registration';
import { StepSharedState } from './stepSharedState';

const feature = loadFeature('features/registration.feature');

defineFeature(feature, (test) => {
  test('Registration', ({ given, and, then }) => {
    const sharedState = new StepSharedState();
    const registration = new Registration(sharedState);

    given(/^A new Eth wallet "(.*)"$/, (addressVar) => {
      registration.addNewWallet(addressVar);
    });
    and(/^"(.*)" is registered$/, (addressVar) => {
      registration.register(addressVar);
    });
    // given(/^banker is registered$/, () => {
    //   registration.registerBanker();
    // });
    then(/^user "(.*)" should be available through api$/, (addressVar) => {
      registration.checkUserRegistrationOffchain(addressVar);
    });
  });
});
