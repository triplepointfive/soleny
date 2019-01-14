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
  #aside
    section#panel
      component(
        :is='menuComponent'
        :input='game.input'
        ref='menuComponent'
      )
    section#status
      | Status
</template>

<script lang="ts">
import Vue, { Component } from "vue";
import Tile from "./Tile.vue";

import IdleInputComponent from "./Input/IdleInputComponent.vue";

import { ship, Game, Ship, Drawer, InputComponent } from "./lib/Ship";

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
  computed: {
    menuComponent(): Component {
      switch (this.game.input.component) {
        case InputComponent.IdleComponent:
          return IdleInputComponent;
      }
    }
  },
  methods: {
    tick() {
      this.game.tick();
    },
    onEvent(event: KeyboardEvent) {
      const menuComponent = this.$refs.menuComponent;
      if (menuComponent) {
        menuComponent.onEvent(event);
      }
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
