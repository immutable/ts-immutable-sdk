import { RouteData } from '../types';

export const sortRoutesByFastestTime = (routes: RouteData[]): RouteData[] => {
  if (!routes) return [];

  return routes.slice().sort((a, b) => {
    // 1.: Prioritise routes where both isInsufficientGas and isInsufficientBalance are false
    if (a.isInsufficientGas !== b.isInsufficientGas || a.isInsufficientBalance !== b.isInsufficientBalance) {
      if (!a.isInsufficientGas && !a.isInsufficientBalance) return -1;
      if (!b.isInsufficientGas && !b.isInsufficientBalance) return 1;
      if (a.isInsufficientGas && !a.isInsufficientBalance) return -1; // isInsufficientGas = true has higher priority
      if (b.isInsufficientGas && !b.isInsufficientBalance) return 1;
    }

    // 2.: Sort by estimatedRouteDuration
    const timeA = a.route.route.estimate.estimatedRouteDuration;
    const timeB = b.route.route.estimate.estimatedRouteDuration;

    if (timeA !== timeB) return timeA - timeB;

    // 3.: Place isInsufficientGas before isInsufficientBalance
    if (a.isInsufficientGas !== b.isInsufficientGas) {
      return a.isInsufficientGas ? -1 : 1;
    }

    return 0;
  });
};
