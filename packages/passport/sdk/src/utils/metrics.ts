// Simple pass-through for metrics since core functionality is in wallet
export const withMetricsAsync = async <T>(
  fn: () => Promise<T>,
  _metric: string,
  _track: boolean = true,
  _flow?: any,
): Promise<T> => fn();

