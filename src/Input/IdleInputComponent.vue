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
  name: "IdleInputComponent",
  computed: {
    options() {
      return {
        u: "Units"
      };
    }
  }
});
</script>
