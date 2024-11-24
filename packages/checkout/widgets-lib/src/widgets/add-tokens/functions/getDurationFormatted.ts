export function getDurationFormatted(
  estimatedRouteDuration: number,
  minutesText: string,
  minuteText: string,
  secondText: string,
) {
  const seconds = estimatedRouteDuration;
  if (seconds >= 60) {
    const minutes = Math.round(seconds / 60);
    return minutes === 1 ? `1 ${minuteText}` : `${minutes} ${minutesText}`;
  }
  return `${seconds.toFixed(0)}${secondText}`;
}
