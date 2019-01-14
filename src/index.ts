/* eslint-env browser */
import "./assets/css/style.scss"

import Vue from "vue"
import Vuex from "vuex"
import Main from "./Main.vue"

Vue.use(Vuex)

import { Game, ship } from "./lib/Ship"

const store = new Vuex.Store({
  state: {
    game: new Game(ship)
  },
  mutations: {
    keyboardEvent(state, event: KeyboardEvent) {
      state.game = state.game.input.process(event.key).call(state.game)
    }
  }
})

new Vue({
  el: "#app",
  store,
  render: h => h(Main)
})
