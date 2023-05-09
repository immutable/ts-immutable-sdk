import { Router } from 'express';

import itemsGet from './__mocks__/itemsGet.json';

const router = Router();

/**
 * https://api.dev.games.immutable.com/inventory/swagger/index.html#/root/get_items__id_
 */
router.get('/inventory/v1/sb/items', (_req, res) => {
  res.status(200).send(itemsGet);
});

export default router;
