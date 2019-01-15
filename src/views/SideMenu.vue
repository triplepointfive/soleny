<template lang="pug">
.input-menu
  .menu-option(v-for='v, k in options')
    .key
      | {{ k }}
    .value
      | {{ v }}
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "SideMenu",
  computed: {
    options(): object {
      return this.$store.state.game.input.options(this.$store.state.game);
    }
  }
});
</script>
