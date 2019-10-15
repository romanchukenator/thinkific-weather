<style scoped>
.weather-image {
  position: absolute;

  height: 100%;
  width: 100%;

  background-image: linear-gradient(rgba(0,0,0,.7), rgba(50,50,5,.2)), url('https://images.unsplash.com/photo-1563467741995-2fccd7316c8f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=900&ixid=eyJhcHBfaWQiOjF9&ixlib=rb-1.2.1&q=80&w=1600');
  background-size: cover;
  background-attachment: fixed;

  filter: blur(4px);
}
</style>

<template blue-grey lighten-5>
  <v-app blue-grey lighten-5>
    <div class="weather-image">
    </div>
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
};
</script>
