export default function calculateDiffValues(
  diffs: [string, number][],
  totalBalance: number,
) {
  return diffs.map(([key, value]) => ({
    key,
    value: (totalBalance / 100) * value,
  }));
}