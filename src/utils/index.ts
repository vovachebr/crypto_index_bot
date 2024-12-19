import { CoinsDataType } from '../coinmarketcap';

export const defaultDbData = {
  users: [],
};

export function calculateMarketStatsByPercentage(
  stats: CoinsDataType,
  strategy: string,
): Record<string, number> {
  if (strategy === 'average') {
    const coinsCount = Object.keys(stats).length;
    return Object.entries(stats).reduce(
      (acc, [coin]) => ({
        ...acc,
        [coin]: (100 / coinsCount).toFixed(2),
      }),
      {},
    );
  }

  const totalCap = Object.values(stats).reduce(
    (acc, { size }) => acc + size,
    0,
  );
  return Object.entries(stats).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: Number(((value.size / totalCap) * 100).toFixed(2)),
    }),
    {},
  );
}

export function calculateBybitStatsByPercentage(input: Record<string, number>) {
  const totalBalance = Object.values(input || {}).reduce(
    (acc, balance) => acc + balance,
    0,
  );
  return Object.entries(input).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: (value / totalBalance) * 100 }),
    {},
  );
}

export function calculateDiffPercentage(
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

export function calculateDiffValues(
  diffs: [string, number][],
  totalBalance: number,
) {
  return diffs.map(([key, value]) => ({
    key,
    value: (totalBalance / 100) * value,
  }));
}
