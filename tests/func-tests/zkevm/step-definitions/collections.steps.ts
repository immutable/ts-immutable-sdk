import { defineFeature, loadFeature } from 'jest-cucumber';
import { DEFAULT_TIMEOUT } from '../config/constants';
import { SharedState } from './shared-state';
import { Collections } from './collections';

const feature = loadFeature('features/collections.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, async (test) => {
  test('List collections', ({
    then,
  }) => {
    const sharedState = new SharedState();
    const collections = new Collections(sharedState);
    then('sdk should list collections', async () => {
      await collections.listCollections();
    });
  }, DEFAULT_TIMEOUT);
});
