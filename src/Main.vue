<template lang="pug">
#scene
  pre(v-for='line in ship')
    span(v-for="tile in line" :class='tileClass(tile)')
      | {{ tile }}
</template>

<script lang="ts">
import Vue from "vue";

import ship from "./lib/Ship";

export default Vue.extend({
  name: "Main",
  data() {
    return {
      ship: ship.split("\n")
    };
  },
  methods: {
    tileClass(tile: string): string {
      return (
        {
          "+": "door",
          " ": "space",
          ".": "space"
        }[tile] || "wall"
      );
    }
  }
});
</script>
