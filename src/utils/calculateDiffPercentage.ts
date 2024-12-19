export default function calculateDiffPercentage(
  marketStatsPercentage: Record<string, number>,
  userStatsPercentageBalance: Record<string, number>,
) {
  let result: Record<string, number> = {};
  const marketStatsKeys = Object.keys(marketStatsPercentage);
  const userStastKeys = Object.keys(userStatsPercentageBalance);

  result = Object.entries(userStatsPercentageBalance)
    .filter(([key]) => !marketStatsKeys.includes(key))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: -value }), result);

  result = Object.entries(marketStatsPercentage)
    .filter(([key]) => !userStastKeys.includes(key))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), result);
    
  result = Object.entries(marketStatsPercentage)
    .filter(([key]) => userStastKeys.includes(key))
    .reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: value - userStatsPercentageBalance[key],
      }),
      result,
    );

  return result;
}