/* eslint-env browser */
import "./assets/css/style.scss"

import Vue from "vue"
import Main from "./Main.vue"

new Vue({
  el: "#app",
  render: h => h(Main)
})
