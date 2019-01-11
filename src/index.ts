/* eslint-env browser */
import "./assets/css/style.css"

import Vue from "vue"
import Main from "./Main.vue"

new Vue({
  el: "#app",
  render: h => h(Main)
})
