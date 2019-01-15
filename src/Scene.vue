<template lang="pug">
.unicodetiles(ref='scene')
</template>
    // .row(v-for='j in game.ship.height')
    //   Tile(
    //     v-for='i in game.ship.width'
    //     :pos='{ x: i - 1, y: j - 1 }'
    //     :drawer='drawer'
    //     :key='i + "-" + j'
    //     )

<script lang="ts">
import Vue from "vue";

import {
  domRenderer,
  canvasRenderer,
  webGLRenderer,
  Engine,
  Viewport,
  Tile
} from "../vendor/unicodetiles.ts/src/index";

import { Drawer, Point } from "./Ship";
import { SymbolTileVisitor, StyleTileVisitor, Drawable } from "./Ship";

const styles: { [key: string]: Tile } = {
  "-wall": new Tile("#", 120, 120, 120, 120, 120, 120)
};

const symbolizer = new SymbolTileVisitor();
const styler = new StyleTileVisitor();

export default Vue.extend({
  name: "Scene",
  props: ["ship"],
  data() {
    return {
      drawer: new Drawer(this.ship),
      term: null,
      eng: null,
      drawInterval: null,
      interval: 100
    };
  },
  methods: {
    getTile(x: number, y: number): Tile | undefined {
      const cell = this.drawer.draw(new Point(x, y));

      if (cell.creatures.length) {
        return new Tile("H", 220, 220, 220);
      }

      if (cell.tile) {
        return (
          styles[cell.tile.visit(styler)] ||
          new Tile(cell.tile.visit(symbolizer), 120, 120, 120)
        );
      }
    },
    initViewport() {
      this.term = new Viewport(
        this.$refs.scene,
        this.ship.width,
        this.ship.height,
        webGLRenderer,
        true
      );

      this.eng = new Engine(
        this.term,
        (x: number, y: number) => this.getTile(x, y),
        this.ship.width,
        this.ship.height
      );

      // this.eng.setMaskFunc((x, y) => {
      //   return this.wholeMap || this.stage.at(x, y).seen;
      // });

      // this.eng.setShaderFunc((tile, x, y, time) => {
      //   return this.lighting(tile, x, y, time);
      // });

      clearInterval(this.drawInterval);
      this.drawInterval = setInterval(() => {
        this.drawScene();
      }, this.interval);
    },
    drawScene() {
      //this.eng.update(this.pos.x, this.pos.y);
      this.eng.update(this.term.cx, this.term.cy);
      //this.eng.update(0, 0);
      this.term.render();
    },
    lighting(tile, x, y, time) {
      if (this.wholeMap) {
        return tile.lighted(1);
      }
      const fovTile = this.stage.at(x, y);

      if (fovTile.visible && tile.lighted) {
        return tile.lighted(fovTile.degree);
      }

      return tile;
    }
  },
  mounted() {
    this.initViewport();
  },
  beforeDestroy() {
    clearInterval(this.drawInterval);
  }
});
</script>

<style lang='scss'>
.unicodetiles {
  font-family: "DejaVuSansMono", "DejaVu Sans Mono", monospace;
  font-size: 2rem;

  div {
    float: left;
    height: 1em;
  }

  br {
    clear: both;
  }
}
</style>
