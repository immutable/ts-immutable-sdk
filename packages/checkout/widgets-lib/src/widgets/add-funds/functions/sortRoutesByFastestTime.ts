import { RouteData } from '../types';

export const sortRoutesByFastestTime = (
  routes: RouteData[] | undefined,
): RouteData[] | undefined => {
  if (!routes) return undefined;

  return routes.slice().sort((a, b) => {
    const timeA = a.route.route.estimate.estimatedRouteDuration;
    const timeB = b.route.route.estimate.estimatedRouteDuration;
    return timeA - timeB;
  });
};
