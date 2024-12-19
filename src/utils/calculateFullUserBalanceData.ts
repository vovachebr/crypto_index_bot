export default function calculateFullUserBalanceData(userWalletBalance: Record<string, number>, userStockBalance: Record<string, number>): Record<string, number> {
  const allKeys = [...new Set(Object.keys(userWalletBalance).concat(Object.keys(userStockBalance)))];
  return allKeys.reduce((acc, key) => {
    return {
      ...acc,
      [key]: (userWalletBalance[key] || 0) + (userStockBalance[key] || 0),
    };
  }, {});
}