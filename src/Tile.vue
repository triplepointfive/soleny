<template lang="pug">
.plan-tile(:class='tileClass')
  | {{ tileSymbol }}
</template>

<script lang="ts">
import Vue from "vue";

import {
  SymbolTileVisitor,
  Tile,
  StyleTileVisitor,
  Drawable
} from "./lib/Ship";

const symbolizer = new SymbolTileVisitor();
const styler = new StyleTileVisitor();

export default Vue.extend({
  name: "Tile",
  props: ["drawer", "pos"],
  computed: {
    drawable(): Drawable {
      return this.drawer.draw(this.pos);
    },
    tileSymbol(): string {
      if (this.drawable.creatures.length) {
        return "H";
      } else if (this.drawable.tile) {
        return this.drawable.tile.visit(symbolizer);
      } else {
        return "";
      }
    },
    tileClass(): string {
      if (this.drawable.tile) {
        return this.drawable.tile.visit(styler);
      } else {
        return "";
      }
    }
  }
});
</script>

<style lang="scss">
.plan-tile {
  font-size: 30px;
  display: inline-block;
  width: 22px;
  height: 32px;
  text-align: center;
  vertical-align: top;
  text-align: center;

  &.-wall {
    background: darkgrey;
    color: darkgrey;
  }

  &.-construction {
    background: grey;
    color: black;
  }

  &.-door {
    background: grey;
    color: black;
  }

  &.-floor {
    background: grey;
    color: lightgrey;
  }
}
</style>
