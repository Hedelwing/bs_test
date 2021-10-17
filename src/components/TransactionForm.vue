<template>
  <v-form class="mt-4" ref="form" @submit.prevent="submit">
    <v-select
      :items="coins"
      item-text="symbol"
      item-value="id"
      label="Coin"
      v-model="values.id"
      hide-details
    ></v-select>
    <v-text-field
      class="mt-4"
      v-model="values.quantity"
      :messages="`Available: ${
        (coinsAvailable && coinsAvailable[values.id]) || 0
      }`"
      label="Quantity"
      type="number"
      :rules="rules && rules(values.id)"
      min="0"
    ></v-text-field>
    <div class="mt-4">
      <v-btn outlined type="submit" block color="primary">Ok</v-btn>
    </div>
  </v-form>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  props: ["coinsAvailable", "onSubmit", "rules"],
  data() {
    return {
      values: null,
    };
  },
  methods: {
    initValues() {
      this.values = {
        id: this.coin,
        quantity: 0,
      };
    },
    submit() {
      if (this.$refs.form?.validate()) {
        this.onSubmit(this.values);
        this.$nextTick(() => {
          this.initValues();
        });
      }
    },
  },
  computed: {
    ...mapGetters(["coins", "coin"]),
  },
  created() {
    this.initValues();
  },
};
</script>