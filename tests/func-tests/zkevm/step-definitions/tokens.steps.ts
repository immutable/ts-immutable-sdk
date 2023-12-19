import { defineFeature, loadFeature } from 'jest-cucumber';
import { SharedState } from './shared-state';
import { Tokens } from './tokens';
import { Balance } from './balance';

const feature = loadFeature('features/tokens.feature', { tagFilter: process.env.TAGS });

defineFeature(feature, test => {
  
    test('Deploy an ERC20 contract', ({
      given,
      when,
      then
    }) => {
      const sharedState = new SharedState();
      const balance = new Balance(sharedState);
      const tokens = new Tokens(sharedState);
      given(/^"(.*)" has at least "(.*)" IMX$/, async (actorVar, amountVar) => {
        await balance.deployerHasImx(actorVar, amountVar);
      });
  
      when(/^deployer deploys an ERC20 contract "(.*)" with symbol "(.*)"$/, async (nameVar, symbolVar) => {
        await tokens.deployERC20Contract(nameVar, symbolVar);        
      });
  
      then(/^deployed erc20 contract should be indexed correctly$/, async () => {
        await tokens.checkDeployedERC20Contract();
      });
    },120 * 1000);

    test('List tokens', ({
      then
    }) => {
        const sharedState = new SharedState();
        const tokens = new Tokens(sharedState);
        then('sdk should list tokens', async () => {
            await tokens.listTokens();
      });
    });
  });