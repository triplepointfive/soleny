<template lang="pug">
.input-menu
  .menu-option(v-for='v, k in options')
    .key
      | {{ k }}
    .value(:class="v.style")
      | {{ v.title }}
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "SideMenu",
  computed: {
    options(): object {
      return this.$store.state.game.input.options;
    }
  }
});
</script>

<style lang="scss">
.input-menu {
  margin: 1rem;

  > .menu-option {
    > .key {
      display: inline;
      margin-right: 0.5rem;
      color: orange;

      &::before {
        content: "[";
      }

      &::after {
        content: "]";
      }
    }

    > .value {
      display: inline;

      &.-active {
        color: white;
      }

      &.-inactive {
        color: grey;
      }
    }
  }
}
</style>
