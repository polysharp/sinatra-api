export function calculateTimeDifferenceInSeconds(
  startTimestamp: number,
  endTimestamp: number,
): number {
  const elapsedMilliseconds = endTimestamp - startTimestamp;

  return Math.floor(elapsedMilliseconds / 1000);
}
