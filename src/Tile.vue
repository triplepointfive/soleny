<template lang="pug">
span.plan-tile(:class='tileClass')
  | {{ tileSymbol }}
</template>

<script lang="ts">
import Vue from "vue";

import { SymbolTileVisitor, Tile, StyleTileVisitor } from "./lib/Ship";

const symbolizer = new SymbolTileVisitor();
const styler = new StyleTileVisitor();

export default Vue.extend({
  name: "Tile",
  props: ["ship", "pos"],
  computed: {
    tile(): Tile {
      return this.ship.at(this.pos);
    },
    tileSymbol(): string {
      return this.tile.visit(symbolizer);
    },
    tileClass(): string {
      return this.tile.visit(styler);
    }
  }
});
</script>

<style lang="scss">
.plan-tile {
  font-size: 2rem;

  &.-wall {
    background: grey;
    color: black;
  }

  &.-door,
  &.-floor {
    background: grey;
    color: lightgrey;
  }
}
</style>
