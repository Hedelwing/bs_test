import CoinGecko from "coingecko-api";

const CoinGeckoClient = new CoinGecko();

export const inByProp = (key, values) => (value) => values.findIndex((val) => val[key] === value) !== -1;

export const convert = (to) => (from, i) => [from[0], from[1] / to[i][1]];

export const updateById = (id, newValue) =>
    value => value.id === id ? { ...value, ...newValue } : value

export const sameId = id => value => value.id === id

export const notSameId = id => value => value.id !== id

export const getPriceHistory = (to, from) => async (coin, vs_currency) => {
    const res = await CoinGeckoClient.coins.fetchMarketChartRange(coin, {
        vs_currency,
        from,
        to,
    });

    return res.data.prices
}

export const getFormattedHistory = (coins, currencies) =>
    (from, to, currency = "usd", coin = "bitcoin") =>
        async (value) => {
            const getHistory = getPriceHistory(from, to)

            if (inByProp("id", currencies)(value)) {
                const from = await getHistory(coin, value);
                const to = await getHistory(coin, currency);

                return to.map(convert(from));
            } else if (inByProp("id", coins)(value)) {
                return await getHistory(value, currency);
            } else {
                throw new Error("Unknown value");
            }
        }

export const getPrice = async (ids, vs_currencies) => {
    const res = await CoinGeckoClient.simple.price({ ids, vs_currencies })

    return res.data
}