import { defineFeature, loadFeature } from 'jest-cucumber';
import { DEFAULT_TIMEOUT } from '../config/constants';
import { SharedState } from './shared-state';
import { Sale } from './sale';

const feature = loadFeature('features/sale.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, test => {
    test('Check for indexed sales', ({
      then,
      and
    }) => {
      const sharedState = new SharedState();
      const sale = new Sale(sharedState);
      then('sdk should list sale activities', async () => {
        await sale.listSaleActivities();
      });
  
      and('sdk should fetch a sale activity', async () => {
        await sale.getSaleActivity();
      });
    }, 180 * DEFAULT_TIMEOUT);
  });