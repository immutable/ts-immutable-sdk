import { Router } from 'express';

import status from './status';
import recipes from './recipe';
import crafting from './crafting';
import inventory from './inventory';
import itemDefinition from './item-definition';

/**
 * Routes
 */
const routes: Router[] = [
  status,
  recipes,
  crafting,
  inventory,
  itemDefinition,
  // ^^ add new routes before this line
];

export default routes;
