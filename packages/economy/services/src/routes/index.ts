import { Router } from 'express';

import status from './status';
import recipes from './recipe';
import crafting from './crafting';
import inventory from './inventory';

/**
 * Routes
 */
const routes: Router[] = [
  status,
  recipes,
  crafting,
  inventory,
  // ^^ add new routes before this line
];

export default routes;
