<template>
  <div>
    <div class="d-flex mt-2 align-start">
      <v-row>
        <v-col cols="12" md="7" lg="8" xl="9">
          <v-data-table
            class="pa-3 elevation-1"
            :headers="tableHeaders"
            :items="valuesPortfolio"
          >
            <template v-slot:top>
              <h5 class="text-h5 my-2 text-center text-uppercase">Coins</h5>
              <div class="d-flex justify-end align-center">
                <v-dialog v-model="dialog" max-width="500px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn color="primary" v-bind="attrs" v-on="on" outlined
                      >Add transaction</v-btn
                    >
                  </template>
                  <v-card class="pa-3">
                    <v-tabs color="primary" v-model="tabs" class="mx-auto tab">
                      <v-tab>Buy</v-tab>
                      <v-tab>Cell</v-tab>
                    </v-tabs>
                    <transaction-form
                      :coinsAvailable="coinsAvailable"
                      v-bind="formProps[tabs]"
                    >
                    </transaction-form>
                  </v-card>
                </v-dialog>
              </div>
            </template>
          </v-data-table>
        </v-col>
        <v-col cols="12" sm="7" md="5" lg="4" xl="3">
          <v-card class="pa-3">
            <h5 class="text-h5 my-4 text-center text-uppercase">
              Portfolio value
            </h5>
            <apexchart
              v-show="total"
              type="pie"
              :options="chartOptions"
              :series="series"
            ></apexchart>
            <v-divider></v-divider>
            <div class="text-h5 pa-2 text-right">
              Total price: {{ total }} {{ currency.toUpperCase() }}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import VueApexCharts from "vue-apexcharts";
import { mapGetters, mapState } from "vuex";
import TransactionForm from "./TransactionForm.vue";

export default {
  components: {
    apexchart: VueApexCharts,
    TransactionForm,
  },
  computed: {
    ...mapGetters(["currency", "valuesPortfolio"]),
    ...mapState(["currentPrices"]),
    total() {
      return this.valuesPortfolio.reduce(
        (acc, cur) => acc + cur.quantity * cur.price,
        0
      );
    },
    series() {
      return this.valuesPortfolio.map(
        ({ price, quantity }) => price * quantity
      );
    },
    chartOptions() {
      return {
        chart: {
          type: "pie",
        },
        colors: ["#782C2E", "#276224"],
        labels: this.valuesPortfolio.map(({ id }) => id),
        legend: {
          formatter: (val) => val.toUpperCase(),
        },
        fill: {
          type: "gradient",
        },
        stroke: {
          colors: "#27262e",
        },
        tooltip: {
          custom: ({ series, seriesIndex }) => {
            const { id, quantity } = this.valuesPortfolio[seriesIndex];
            return `<div class="arrow_box pa-2">
              <div>${quantity} ${id.toUpperCase()}</div>
              <div>${(
                series[seriesIndex] +
                " " +
                this.currency
              ).toUpperCase()}</div>
            </div>`;
          },
        },
      };
    },
    coinsAvailable() {
      return this.valuesPortfolio.reduce(
        (acc, { id, quantity }) => ({ ...acc, [id]: quantity }),
        {}
      );
    },
    tableHeaders() {
      const currency = this.currency.toUpperCase();

      return [
        { text: "Coin", value: "id" },
        { text: "Quantity", value: "quantity" },
        { text: `Price (${currency})`, value: "price" },
        { text: `Total price (${currency})`, value: "total" },
      ];
    },
    formProps() {
      const { buyValue, sellValue, coinsAvailable } = this;
      return [
        {
          onSubmit: buyValue,
        },
        {
          onSubmit: sellValue,
          rules: (coin) => [(v) => +v <= (coinsAvailable[coin] || 0)],
        },
      ];
    },
  },
  data() {
    return {
      dialog: false,
      tabs: 0,
    };
  },
  methods: {
    buyValue(value) {
      this.dialog = false;

      this.$store.commit("buyValue", value);
    },
    sellValue(value) {
      this.dialog = false;

      this.$store.commit("sellValue", value);
    },
  },
};
</script>