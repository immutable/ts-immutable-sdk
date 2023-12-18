import { defineFeature, loadFeature } from 'jest-cucumber';
import { DEFAULT_TIMEOUT } from '../config/constants';
import { Chains } from './chains';
import { SharedState } from './shared-state';

const feature = loadFeature('features/chains.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, (test) => {
  test('List chains', ({
    then,
  }) => {
    const sharedState = new SharedState();
    const chains = new Chains(sharedState);
    then('sdk should list chains', async () => {
      await chains.listChains();
    });
  }, DEFAULT_TIMEOUT);
});
