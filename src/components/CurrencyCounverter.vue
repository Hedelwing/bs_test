<script>
import VueApexCharts from "vue-apexcharts";
import { mapGetters, mapState } from "vuex";
import { sameId } from "../utils";

export default {
  components: {
    apexchart: VueApexCharts,
  },
  watch: {
    values: {
      handler() {
        this.$store.dispatch("changeConverterCurrencies");
      },
      deep: true,
    },
    valuesConverter: {
      handler() {
        this.$store.dispatch("convertValue");
      },
      deep: true,
    },
  },
  methods: {
    swap() {
      this.$store.dispatch("swapCurrencies");
    },
  },
  computed: {
    ...mapState(["priceHistory", "currentPrices", "converter"]),
    ...mapGetters(["coins", "currencies", "coin", "currency"]),
    valueFrom: {
      get() {
        return this.converter.values.from;
      },
      set(value) {
        return this.$store.dispatch("changeConverterValues", { from: +value });
      },
    },
    valueTo: {
      get() {
        return this.converter.values.to;
      },
    },
    currencyFrom: {
      get() {
        return this.converter.currencies.from;
      },
      set(value) {
        return this.$store.dispatch("changeConverterCurrencies", {
          from: value,
        });
      },
    },
    currencyTo: {
      get() {
        return this.converter.currencies.to;
      },
      set(value) {
        return this.$store.dispatch("changeConverterCurrencies", { to: value });
      },
    },
    marketHistory() {
      return (
        (this.priceHistory[this.currencyFrom] &&
          this.priceHistory[this.currencyFrom][this.currencyTo]) ??
        []
      );
    },
    series() {
      const { currencies, coins, currencyTo } = this;
      const value =
        currencies.find(sameId(currencyTo)) || coins.find(sameId(currencyTo));
      return [
        {
          name: `Price (${value?.symbol.toUpperCase()})`,
          data: this.marketHistory,
        },
      ];
    },
    chartOptions() {
      return {
        chart: {
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          type: "datetime",
        },
        yaxis: {
          labels: {
            offsetX: -16,
            formatter: (value) => +value.toFixed(6).replace(/0+$/, ""),
          },
        },
        tooltip: {
          theme: "dark",
          x: {
            format: "dd MMM yyyy, hh:mm:ss",
            labels: {
              colors: ["#e3c9a6"],
            },
          },
        },
        colors: ["#e3c9a6"],
        fill: {
          colors: ["#bb9f89", "#e3c9a6"],
          type: "gradient",
          gradient: {
            shade: "dark",
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.9,
            stops: [0, 100],
          },
        },
      };
    },
  },
};
</script>

<template>
  <v-card class="pa-3">
    <div class="converter">
      <div class="converter__item">
        <v-text-field
          hide-details
          type="number"
          min="0"
          step="0.1"
          v-model="valueFrom"
          class="converter__input"
        ></v-text-field>
        <v-select
          :items="[...coins, ...currencies]"
          item-text="symbol"
          item-value="id"
          v-model="currencyFrom"
          color="primary"
          hide-details
          class="converter__input"
        ></v-select>
      </div>
      <v-btn fab x-small class="mx-2" @click="swap">
        <v-icon color="primary">mdi-swap-horizontal</v-icon>
      </v-btn>
      <div class="converter__item">
        <v-text-field
          class="converter__input"
          hide-details
          v-model="valueTo"
          readonly
        ></v-text-field>
        <v-select
          :items="[...coins, ...currencies]"
          item-text="symbol"
          item-value="id"
          v-model="currencyTo"
          hide-details
          class="converter__input"
        ></v-select>
      </div>
    </div>
    <div>
      <h5 class="text-h5 my-4 text-center text-uppercase">Price Chart</h5>
      <apexchart
        type="area"
        height="320"
        :options="chartOptions"
        :series="series"
      ></apexchart>
    </div>
  </v-card>
</template>


<style lang="scss">
@import "../scss/variables.scss";

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(map-get($material-dark, "cards"), 0.85);
}

.converter {
  display: inline-flex;
  align-items: center;
  border: 1px solid #bb9f89;
  border-radius: 4px;
  padding: 8px;
  &__item {
    display: flex;
    flex-direction: column;
    @media (min-width: 500px) {
      flex-direction: row;
    }
  }
  &__input {
    min-width: 84px;
    width: min-content;
    margin: 0 !important;
    padding: 0 !important;
    &:not(:first-child) {
      margin: 4px 0 0 !important;
      @media (min-width: 500px) {
        margin: 0 0 0 8px !important;
      }
    }
  }
}
</style>