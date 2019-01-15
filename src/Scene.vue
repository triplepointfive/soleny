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
} from "../vendor/unicodetiles.ts/src/index";

import {
  SymbolTileVisitor,
  StyleTileVisitor,
  Drawable,
  Drawer,
  Point,
  Game,
  Ship
} from "./Ship";

const styles: { [key: string]: Tile } = {
  "-wall": new Tile("#", 120, 120, 120, 120, 120, 120),
  "-open-door": new Tile("＋", 120, 120, 120, 0, 0, 0),
  "-close-door": new Tile("－", 0, 0, 0, 120, 120, 120)
};

const symbolizer = new SymbolTileVisitor();
const styler = new StyleTileVisitor();

export default Vue.extend({
  name: "Scene",
  data() {
    return {
      term: null,
      eng: null,
      drawInterval: null,
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
    getTile(x: number, y: number): Tile | undefined {
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
