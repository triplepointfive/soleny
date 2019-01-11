<template lang="pug">
#scene
  pre(v-for='j in ship.height')
    Tile(
      v-for='i in ship.width'
      :pos='{ x: i - 1, y: j - 1 }'
      :ship='ship'
      :key='i + "-" + j'
      )
</template>

<script lang="ts">
import Vue from "vue";
import Tile from "./Tile.vue";

import { ship, Ship } from "./lib/Ship";

export default Vue.extend({
  name: "Main",
  data() {
    return {
      ship: ship as Ship
    };
  },
  components: {
    Tile
  }
});
</script>
