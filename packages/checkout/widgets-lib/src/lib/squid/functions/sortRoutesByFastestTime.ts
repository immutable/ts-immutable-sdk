import { RouteData } from '../types';

export const sortRoutesByFastestTime = (routes: RouteData[]): RouteData[] => {
  if (!routes) return [];

  return routes.slice().sort((a, b) => {
    // Prioritize isInsufficientGas = false
    if (a.isInsufficientGas !== b.isInsufficientGas) {
      return a.isInsufficientGas ? 1 : -1;
    }

    // Sort by estimatedRouteDuration if isInsufficientGas is the same
    const timeA = a.route.route.estimate.estimatedRouteDuration;
    const timeB = b.route.route.estimate.estimatedRouteDuration;

    return timeA - timeB;
  });
};
