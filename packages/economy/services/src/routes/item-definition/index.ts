import { Router } from 'express';

import itemsGet from './__mocks__/itemDefinitionsGet.json';

const router = Router();

/**
 * https://api.dev.games.immutable.com/inventory/swagger/index.html#/root/get_items__id_
 */
router.get('/item-definition/definitions', (_req, res) => {
  res.status(200).send(itemsGet);
});

router.get('/item-definition/definitions/:id', (req, res) => {
  const itemDef = itemsGet.find((item) => item.id === req.params.id);
  if (!itemDef) res.status(500).send();

  res.status(200).send(itemDef);
});

export default router;
