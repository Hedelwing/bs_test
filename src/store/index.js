import Vue from 'vue'
import Vuex from 'vuex'
import { getFormattedHistory, convert, getPrice, inByProp, updateById, sameId, notSameId } from '../utils';

Vue.use(Vuex)

export default new Vuex.Store({
  getters: {
    coins: state => state.values.coins,
    currencies: state => state.values.currencies,
    coin: state => state.defaultValues.coin,
    currency: state => state.defaultValues.currency,
    valuesPortfolio: ({ portfolio, currentPrices, defaultValues }) => {
      return portfolio.map(value => {
        const price = currentPrices && currentPrices[value.id][defaultValues.currency]
        const total = price * value.quantity

        return { ...value, price, total }
      })
    }
  },
  state: {
    values: {
      coins: [
        {
          "id": "bitcoin",
          "symbol": "BTC"
        },
        {
          "id": "ethereum",
          "symbol": "ETH"
        }
      ],
      currencies: [
        {
          "id": "usd",
          "symbol": "USD",
        }
      ]
    },
    defaultValues: {
      coin: "bitcoin",
      currency: "usd"
    },
    currentPrices: null,
    priceHistory: {},
    portfolio: [
      { id: "bitcoin", quantity: 1 },
    ],
    isInit: false,
    converter: {
      currencies: {
        from: "bitcoin",
        to: "usd",
      },
      values: {
        from: 1,
        to: null,
      },
    }
  },
  mutations: {
    initialize(state) {
      state.isInit = true
    },
    changeConverterCurrencies(state, payload) {
      state.converter.currencies = { ...state.converter.currencies, ...payload }
    },
    changeConverterValues(state, payload) {
      state.converter.values = { ...state.converter.values, ...payload }
    },
    swapCurrencies(state, payload) {
      state.converter.currencies = payload
    },
    convertValue(state, payload) {
      state.converter.values.to = payload
    },
    setPrices(state, prices) {
      state.currentPrices = prices
    },
    setPriceHistory(state, price) {
      state.priceHistory = { ...state.priceHistory, ...price }
    },
    errorHandler(state, error) {
      state.error = error.message
    },
    buyValue(state, coin) {
      const inPortfolio = inByProp("id", state.portfolio)

      const updateQuantity = ({ id, quantity }) => {
        const oldValue = state.portfolio.find(sameId(id))
        const newValue = +oldValue.quantity + +quantity

        return updateById(id, { quantity: newValue })
      }

      state.portfolio = inPortfolio(coin.id)
        ? state.portfolio.map(updateQuantity(coin))
        : [...state.portfolio, coin]
    },
    sellValue(state, value) {
      const inPortfolio = inByProp("id", state.portfolio)

      const updateQuantity = (value, portfolio) => {
        if (inPortfolio(value.id)) {
          const oldValue = portfolio.find(sameId(value.id))
          const newValue = +oldValue.quantity - +value.quantity

          return newValue === 0
            ? portfolio.filter(notSameId(value.id))
            : portfolio.map(updateById(value.id, { quantity: newValue }))
        } else return portfolio
      }

      state.portfolio = updateQuantity(value, state.portfolio)
    },
  },
  actions: {
    initialize({ dispatch, commit }) {
      const res1 = dispatch('getPrices')
      const res2 = dispatch('getPriceHistory')

      Promise.all([res1, res2]).then(() => {
        dispatch('convertValue')
        commit('initialize')
      })
    },
    async getPrices({ commit, state: { values: { coins, currencies } } }) {
      const ids = coins.map(({ id }) => id)
      const vs_currencies = currencies.map(({ id }) => id)
      try {
        const price = await getPrice(ids, vs_currencies)
        commit("setPrices", price)
      } catch (e) {
        commit("errorHandler", e)
      }
    },
    async getPriceHistory({ state: { values: { coins, currencies }, converter: { currencies: { from, to } } }, commit }) {
      const toDate = Date.now() / 1000
      const fromDate = toDate - 1209600

      const getPriceHistory = getFormattedHistory(coins, currencies)(toDate, fromDate)

      try {
        const fromPrice = await getPriceHistory(from);
        const toPrice = await getPriceHistory(to);

        commit("setPriceHistory", {
          [from]: {
            [to]: fromPrice.map(convert(toPrice))
          }
        })
      } catch (e) {
        console.error(e);
      }
    },
    swapCurrencies({ commit, dispatch, state }) {
      const { from, to } = state.converter.currencies
      const swapped = { to: from, from: to }

      commit('swapCurrencies', swapped)
      dispatch('convertValue')
      dispatch('getPriceHistory')
    },
    changeConverterCurrencies({ commit, dispatch }, payload) {
      commit('changeConverterCurrencies', payload)

      dispatch('convertValue');
      dispatch('getPriceHistory');
    },
    changeConverterValues({ commit, dispatch }, payload) {
      commit('changeConverterValues', payload)

      dispatch('convertValue');
    },
    convertValue({ state: { converter, values, currentPrices }, commit }) {
      const from = converter.values.from;
      const fromVal = converter.currencies.from;
      const toVal = converter.currencies.to;

      const convertCurrency = (from, to, prices) => {
        const isCoins = inByProp("id", values.coins);
        const isCurrency = inByProp("id", values.currencies);

        if (isCoins(from) && isCurrency(to)) {
          return prices[from][to];
        } else if (isCoins(from) && isCoins(to)) {
          return prices[to]["usd"] / prices[from]["usd"];
        } else if (isCurrency(from) && isCurrency(to)) {
          return prices["bitcoin"][to] / prices["bitcoin"][from];
        } else if (isCurrency(from) && isCoins(to)) {
          return 1 / prices[to][from];
        } else {
          console.error("Unknown value")
        }
      };

      const convertedValue = convertCurrency(fromVal, toVal, currentPrices).toFixed(6).replace(/0+$/, "")
      const totalValue = convertedValue * from;

      commit("changeConverterValues", { to: totalValue })
    },
  }
})
