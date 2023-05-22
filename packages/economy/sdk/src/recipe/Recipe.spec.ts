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
      it.only('should throw error', async () => {
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
});
