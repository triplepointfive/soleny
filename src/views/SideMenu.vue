<template lang="pug">
.input-menu
  .menu-option(v-for='v, k in options')
    .key
      | {{ k }}
    .value(:class="v.style")
      | {{ v.title }}
    .description(v-if="v.description")
      | {{ v.description }}
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
$key_width: 3rem;

.input-menu {
  margin: 1rem;

  > .menu-option {
    > .key {
      display: inline-block;
      color: orange;
      width: $key_width;

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

    > .description {
      margin-left: $key_width;
      color: lightgrey;
    }
  }
}
</style>
