import { Router } from 'express';

import itemsGet from './__mocks__/itemDefinitionGet.json';

const router = Router();

/**
 * https://api.dev.games.immutable.com/inventory/swagger/index.html#/root/get_items__id_
 */
router.get(
  '/item-definition/v1/definitions/0f89554b-2c92-4220-b43e-8317a0b117c5',
  (_req, res) => {
    res.status(200).send(itemsGet);
  }
);

export default router;
