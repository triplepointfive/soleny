<template lang="pug">
.container
  #scene
    pre(v-for='j in game.ship.height')
      Tile(
        v-for='i in game.ship.width'
        :pos='{ x: i - 1, y: j - 1 }'
        :drawer='drawer'
        :key='i + "-" + j'
        )
</template>

<script lang="ts">
import Vue from "vue";
import Tile from "./Tile.vue";

import { ship, Game, Ship, Drawer } from "./lib/Ship";

export default Vue.extend({
  name: "Main",
  data() {
    return {
      game: new Game(ship),
      drawer: new Drawer(ship),
      tickInterval: 0
    };
  },
  components: {
    Tile
  },
  methods: {
    tick() {
      this.game.tick();
    }
  },
  mounted() {
    this.tickInterval = window.setInterval(() => this.tick(), 100);
  },
  beforeDestroy() {
    window.clearInterval(this.tickInterval);
  }
});
</script>
