<template lang="pug">
.container
  #scene
    .row(v-for='j in game.ship.height')
      Tile(
        v-for='i in game.ship.width'
        :pos='{ x: i - 1, y: j - 1 }'
        :drawer='drawer'
        :key='i + "-" + j'
        )
  #aside
    section#panel
      SideMenu
    section#status
      div {{ this.game.distanceLeft }}km left to Jupiter
      div Ship's speed {{ this.game.speed / 10 }}km/s
</template>

<script lang="ts">
import Vue, { Component } from "vue";
import Tile from "./Tile.vue";

import SideMenu from "./SideMenu.vue";

import { ship, Game, Ship, Drawer } from "./lib/Ship";

export default Vue.extend({
  name: "Main",
  data() {
    return {
      drawer: new Drawer(ship),
      tickInterval: 0
    };
  },
  components: {
    Tile,
    SideMenu
  },
  computed: {
    game(): Game {
      return this.$store.state.game;
    }
  },
  methods: {
    tick() {
      this.game.tick();
    },
    onEvent(event: KeyboardEvent) {
      this.$store.commit("keyboardEvent", event);
    }
  },
  mounted() {
    this.tickInterval = window.setInterval(() => this.tick(), 100);
    document.addEventListener("keydown", this.onEvent);
  },
  beforeDestroy() {
    window.clearInterval(this.tickInterval);
    document.removeEventListener("keydown", this.onEvent);
  }
});
</script>

<style lang="scss">
.container {
  position: relative;
  height: 100%;

  #scene {
    position: absolute;
    left: 25%;
    transform: translate(50%, 0);

    .row {
      margin: 0;
      //font-family: "Anonymous Pro", monospace;
      font-family: "DejaVu Sans Mono", arial;
    }
  }

  #aside {
    border-left: 1px solid white;
    position: absolute;
    right: 0;
    width: 25%;
    height: 100%;

    #status {
      border-top: 1px solid white;
      position: absolute;
      bottom: 200px;
      width: 100%;
    }
  }
}
</style>
