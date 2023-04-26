import { Router } from 'express';

import recipesGet from './__mocks__/recipesGet.json';

const router = Router();

/**
 * https://api.dev.games.immutable.com/recipe/swagger/index.html#/root/get_recipes
 */
router.get('/recipe/recipes', (_req, res) => {
  res.status(200).send(recipesGet);
});

/**
 * https://api.dev.games.immutable.com/recipe/swagger/index.html#/root/get_recipes__id_
 */
router.get('/recipe/recipe/:id', (req, res) => {
  const recipe = recipesGet.find((r) => r.id === req.params.id);
  if (!recipe) res.status(500).send();

  res.status(200).send(recipe);
});

export default router;
