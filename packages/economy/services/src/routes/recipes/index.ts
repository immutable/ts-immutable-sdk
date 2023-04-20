import { Router } from 'express';

import allRecipes from './__mocks__/get_recipes.json';

const router = Router();

/**
 * https://api.dev.games.immutable.com/recipe/swagger/index.html#/root/get_recipes
 */
router.get('/recipes', (_req, res) => {
  res.status(200).send(allRecipes);
});
