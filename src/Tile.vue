<template lang="pug">
.plan-tile(:class='tileClass')
  | {{ tileSymbol }}
</template>

<script lang="ts">
import Vue from "vue";

import { SymbolTileVisitor, Tile, StyleTileVisitor, Drawable } from "./Ship";

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
    tileClass(): { [key: string]: boolean } {
      if (this.drawable.tile) {
        let classes = {
          [this.drawable.tile.visit(styler)]: true
        };

        if (this.drawable.selected) {
          classes[
            this.$store.state.frame % 2 == 1 ? "-frame1" : "-frame2"
          ] = true;
        }

        return classes;
      } else {
        return {};
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

    &.-frame1 {
      color: darkgreen;
    }

    &.-frame2 {
      color: darkred;
    }
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
