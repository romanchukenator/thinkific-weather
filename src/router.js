import Vue from 'vue'
import Router from 'vue-router'
import Forecast from './components/Forecast.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'forecast',
      component: Forecast
    },
  ]
})
