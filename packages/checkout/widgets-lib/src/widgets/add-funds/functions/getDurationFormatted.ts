export function getDurationFormatted(estimatedRouteDuration: number) {
  const seconds = estimatedRouteDuration;
  if (seconds >= 60) {
    const minutes = Math.round(seconds / 60);
    return minutes === 1 ? '1 min' : `${minutes} mins`;
  }
  return `${seconds.toFixed(0)}s`;
}