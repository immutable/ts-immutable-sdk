export type TrackOptions = {
  durationMs?: number;
  error?: Error;
};

export type MetricEvent = {
  module: string;
  name: string;
  time: number;
  durationMs?: number;
  error?: { name?: string; code?: string };
};

export type MetricsConfig = {
  clientId?: string;
};
