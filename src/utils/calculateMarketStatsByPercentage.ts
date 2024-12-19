import { CoinsDataType } from "../coinmarketcap";

export default function calculateMarketStatsByPercentage(
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