import { Router } from 'express';

import status from './status';
import recipes from './recipe';
import crafting from './crafting';

/**
 * Routes
 */
const routes: Router[] = [
  status,
  recipes,
  crafting,
  // ^^ add new routes before this line
];

export default routes;
