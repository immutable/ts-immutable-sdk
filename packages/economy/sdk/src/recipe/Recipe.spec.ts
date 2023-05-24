/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable class-methods-use-this */
/**
 * @jest-environment node
 */

import 'reflect-metadata';
import Container from 'typedi';

import { Config, defaultConfig } from '../Config';
import { SDKError } from '../Errors';
import { StudioBE } from '../StudioBE';
import { Recipe } from './Recipe';
import { DomainInput, DomainRecipe } from '../__codegen__/recipe';

describe(Recipe.name, () => {
  beforeAll(() => {
    Container.reset();
    Container.set(Config, new Config(defaultConfig));
  });

  describe('getRecipes', () => {
    describe('when status is 200', () => {
      it('should return an array of recipes ', async () => {
        const recipesGetFn = jest.fn().mockImplementation((input: { gameId: string, filter?: string[] }) => ({
          status: 200,
          data: [],
        }));
        Container.set(StudioBE, new (class {
          recipeApi = {
            recipesGet: recipesGetFn,
          };
        })());

        const recipe = Container.get(Recipe);
        const response = await recipe.getAll({ gameId: '111' });
        expect(recipesGetFn).toHaveBeenCalledWith({ gameId: '111' });
        expect(response).toEqual([]);
      });
    });

    describe('when status is not 200', () => {
      it('should throw error', async () => {
        const recipesGetFn = jest.fn().mockImplementation((input: { gameId: string, filter?: string[] }) => {
          throw new Error();
        });
        Container.set(StudioBE, new (class {
          recipeApi = {
            recipesGet: recipesGetFn,
          };
        })());
        const recipe = Container.get(Recipe);

        try {
          expect(recipe.getAll({ gameId: '' })).toThrowError();
        } catch (error) { /* empty */ }

        try {
          const response = await recipe.getAll({ gameId: '' });
        } catch (error) {
          expect(error).toBeInstanceOf(SDKError);
        }
      });
    });
  });

  describe('getInputsBy', () => {
    it('should return recipe input and index when given a recipe and predicateFn condition', () => {
      const recipe = {
        id: 'a9e66897-08e1-482f-887a-1611f9d824bf',
        game_id: 'shardbound',
        name: 'Test Recipe',
        description: 'Just a basic recipe',
        status: 'draft',
        inputs: [
          {
            id: 'f8f716ad-5191-478e-85d7-f3f1e7bcad02',
            type: 'single_item',
            name: 'card_to_upgrade',
            conditions: [
              {
                type: '',
                ref: 'properties.name',
                comparison: 'eq',
                expected: 'Spellboxer3',
              },
            ],
          },
          {
            id: 'bdd945d4-2f34-4d04-9562-c318a5739b1b',
            type: 'multiple_items',
            name: 'dust_payment',
            conditions: [
              {
                type: 'sum',
                ref: 'properties.dust_power',
                comparison: 'gte',
                expected: '150',
              },
            ],
          },
        ],
        outputs: [
          {
            id: '46b74c0b-bc2b-410b-9494-0295aa234e0d',
            type: 'item_definition',
            name: 'upgraded_card',
            ref: '63850a2b-79f1-480f-9131-cf46a6fe5b07',
            data: {
              'properties.level': '2',
            },
          },
        ],
        created_at: '2023-04-11T23:35:33.411305Z',
        updated_at: '2023-04-11T23:35:33.411305Z',
      };
      const predicateFn = (input: any) => input.name === 'card_to_upgrade';
      const response = Recipe.getInputsBy(recipe, predicateFn);
      expect(response).toEqual([[recipe.inputs[0], 0]]);
    });
  });
});
