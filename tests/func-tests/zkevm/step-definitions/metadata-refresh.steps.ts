import { defineFeature, loadFeature } from 'jest-cucumber';
import { SharedState } from './shared-state';
import { DEFAULT_TIMEOUT } from 'config/constants';
import { MetadataRefresh } from './metadata-refresh';

const feature = loadFeature('features/metadata-refresh.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, test => {
    test('Refresh Collection Metadata', ({
      then,
      and
    }) => {
      const sharedState = new SharedState();
      const metadataRefresh = new MetadataRefresh(sharedState);
      then('sdk should refresh collection metadata', async () => {
        await metadataRefresh.refreshCollectionMetadata();
      });
  
      and('sdk should queue a refresh for multiple token metadata', async () => {
        await metadataRefresh.refreshTokenMetadata();
      });
  
      and('sdk should fetch refreshed token with a refreshed result', async () => {
        await metadataRefresh.getToken();
      });
  
      and('sdk should queue a refresh for multiple token metadata', async () => {
        await metadataRefresh.refreshMetadataById();
      });
  
      and('sdk should fetch refreshed token with a refreshed result', async () => {
        await metadataRefresh.getToken();
      });
    }, DEFAULT_TIMEOUT);
  });