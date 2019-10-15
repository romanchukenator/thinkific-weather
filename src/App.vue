<template blue-grey lighten-5>
  <v-app blue-grey lighten-5>
    <v-content>
      <Forecast />
    </v-content>
  </v-app>
</template>

<script>
import Forecast from './components/Forecast';

export default {
  name: 'App',
  components: {
    Forecast,
  },
  data: () => ({
    //
  }),
};
</script>
