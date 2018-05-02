<template>
  <router-view />
</template>

<script>
import Vue from 'vue'
import Buefy from 'buefy'
import 'buefy/lib/buefy.css'

Vue.use(Buefy)

export default Vue.extend({
  name: 'App'
})
</script>
