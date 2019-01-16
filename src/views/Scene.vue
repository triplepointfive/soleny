<template lang="pug">
.unicodetiles(ref='scene')
</template>

<script lang="ts">
import Vue from "vue";

import {
  domRenderer,
  canvasRenderer,
  webGLRenderer,
  Engine,
  Viewport,
  Tile
} from "unicodetiles.ts";

import {
  SymbolTileVisitor,
  StyleTileVisitor,
  Drawable,
  Drawer,
  Game,
  Ship
} from "../models/Ship";

import { Point } from "../lib/Point";

const styles: { [key: string]: Tile } = {
  "-wall": new Tile("#", 120, 120, 120, 120, 120, 120),
  "-open-door": new Tile("＋", 120, 120, 120, 0, 0, 0),
  "-close-door": new Tile("－", 0, 0, 0, 120, 120, 120)
};

const symbolizer = new SymbolTileVisitor(),
  styler = new StyleTileVisitor();

let term: Viewport | null = null,
  eng: Engine | null = null;

export default Vue.extend({
  name: "Scene",
  data() {
    return {
      drawInterval: 0,
      interval: 100
    };
  },
  computed: {
    ship(): Ship {
      return this.game.ship;
    },
    drawer(): Drawer {
      return this.game.drawer;
    },
    game(): Game {
      return this.$store.state.game;
    }
  },
  methods: {
    getTile(x: number, y: number): Tile {
      const pos = new Point(x, y);

      if (this.drawer.isCursor(pos)) {
        return new Tile("Ｘ", 120, 220, 120);
      }

      const cell = this.drawer.draw(pos);

      if (cell.creatures.length) {
        return new Tile("H", 220, 220, 220);
      }

      if (cell.tile) {
        return (
          styles[cell.tile.visit(styler)] ||
          new Tile(cell.tile.visit(symbolizer), 120, 120, 120)
        );
      }

      return new Tile("E", 255, 0, 0, 0, 0, 0);
    },
    initViewport() {
      const scene = this.$refs.scene;
      if (scene instanceof Element) {
        term = new Viewport(
          scene,
          this.ship.width,
          this.ship.height,
          webGLRenderer,
          true
        );

        eng = new Engine(
          term,
          (x: number, y: number) => this.getTile(x, y),
          this.ship.width,
          this.ship.height
        );

        window.clearInterval(this.drawInterval);
        this.drawInterval = window.setInterval(() => {
          this.drawScene();
        }, this.interval);
      }
    },
    drawScene() {
      if (eng && term) {
        eng.update(term.cx, term.cy);
        term.render();
      }
    }
  },
  mounted() {
    this.initViewport();
  },
  beforeDestroy() {
    window.clearInterval(this.drawInterval);
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
