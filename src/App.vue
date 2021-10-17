<template>
  <v-app>
    <v-main>
      <v-container v-if="isInit">
        <header>
          <v-tabs color="primary" v-model="tab" class="flex-grow-0 ml-auto tab">
            <v-tab v-for="page in pages" :key="page">
              {{ page }}
            </v-tab>
          </v-tabs>
        </header>
        <div class="mt-8">
          <v-tabs-items v-model="tab" class="tab-items">
            <v-tab-item>
              <converter class="mt-4" />
            </v-tab-item>
            <v-tab-item>
              <portfolio />
            </v-tab-item>
          </v-tabs-items>
        </div>
      </v-container>
      <v-container v-else class="fill-height justify-center">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Converter from "./components/CurrencyCounverter.vue";
import Portfolio from "./components/Portfolio.vue";
import { mapActions, mapState } from "vuex";

export default {
  name: "App",
  components: {
    Converter,
    Portfolio,
  },
  data() {
    return {
      tab: null,
      pages: ["currency", "portfolio"],
    };
  },
  methods: {
    ...mapActions(["initialize"]),
  },
  computed: {
    ...mapState(["isInit"]),
  },
  created() {
    this.initialize();
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Montserrat&display=swap");

.apexcharts-text {
  font-size: 10px !important;
  font-family: Montserrat, sans-serif !important;
  fill: #e3c9a6 !important;
}

input[type="number"]::-webkit-inner-spin-button {
  display: none;
}

.apexcharts-legend-text {
  color: #e3c9a6 !important;
}

.tab {
  width: max-content !important;
  border: 1px solid #bb9f89;
  border-radius: 4px;
  &-items {
    background: transparent !important;
  }
}
</style>
