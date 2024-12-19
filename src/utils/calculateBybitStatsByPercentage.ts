export default function calculateBybitStatsByPercentage(input: Record<string, number>) {
  const totalBalance = Object.values(input || {}).reduce(
    (acc, balance) => acc + balance,
    0,
  );
  return Object.entries(input).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: (value / totalBalance) * 100 }),
    {},
  );
}