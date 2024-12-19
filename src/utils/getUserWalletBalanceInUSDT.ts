export default function getUserWalletBalanceInUSDT(coinsPrices: Record<string, number>, userWalletBalanceInCoinsData: Record<string, number>): Record<string, number> {
    return Object.entries(userWalletBalanceInCoinsData).reduce((acc, [coin, balance]) => {
        const price = coinsPrices[coin];
        if (price) {
            return {
                ...acc,
                [coin]: price * balance,
            };
        }
        return acc;
    }, {});
}