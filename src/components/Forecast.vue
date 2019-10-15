<template>
  <v-container>

    <v-layout wrap>

      <v-flex mb-4 v-if="forecast">
        <div class="city-name mb-12 pb-12">

          <v-text-field
            class="display-1"
            v-model="searchCity"
            v-on:keyup.enter="forecastByCity"

            v-bind:loading="isLoading"
            v-bind:disabled="isLoading"

            v-bind:persistent-hint="true"
            v-bind:hint="forecastNow.time"
            v-bind:error="error"
            v-bind:error-messages="errorMessages"
          ></v-text-field>

        </div>

        <div class="temperature mt-12 pt-12">
          <h1 class="display-4">
            {{ temperature }}
          </h1>

         <v-flex class="weather-description d-inline-flex align-center">
            <v-img v-if="iconURL"
              :src=iconURL
              contain
              max-height="50"
              max-width="50"
            ></v-img>

            <span class="subheading font-weight-regular">
              {{ forecastNow.description }}
            </span>
         </v-flex>
        </div>

        <v-divider></v-divider>
        <!-- <h1 class="display-1">
          Weeklong outlook
        </h1>
        <v-sparkline v-if="forecast"
          :value="temperatureForecast.temps"

          :labels="temperatureForecast.times"
          :label-size=2
          :show-labels=false

          :gradient="gradient"
          :smooth=5
          :padding=10
          :line-width=2
          :stroke-linecap="'round'"

          auto-draw
        >
          <template v-slot:label="item">
            {{ item.value }}
          </template>
        </v-sparkline> -->
      </v-flex>

    </v-layout>

  </v-container>
</template>

<script>
import moment from 'moment';

export default {
  mounted: function() {
    if ("geolocation" in navigator) {
      navigator.geolocation
        .getCurrentPosition(this.forecastByCoordinates, this.handleGeolocationError);
    } else {
      this.forecastByCity();
    }
  },

  data: () => ({
    gradient: ['#f72047', '#ffd200', '#1feaea'],

    apiKey: '&appid=8892e2d93e33cc9aaa8d85e5a6ee11bc',

    baseURL: 'https://api.openweathermap.org/data/2.5/forecast?',

    description: null,

    error: false,

    errorMessages: [],

    forecast: null,

    iconURL: null,

    isLoading: false,

    isIconLoading: false,

    searchCity: 'Vancouver,ca',

    units: '&units=metric',

    ecosystem: [
      {
        text: 'vuetify-loader',
        href: 'https://github.com/vuetifyjs/vuetify-loader',
      },
      {
        text: 'github',
        href: 'https://github.com/vuetifyjs/vuetify',
      },
      {
        text: 'awesome-vuetify',
        href: 'https://github.com/vuetifyjs/awesome-vuetify',
      },
    ],
  }),

  computed: {
    forecastNow: function() {
      const [city, country, time, description, iconCode, temperature] = [
        this.forecast.city.name, // city
        this.forecast.city.country, // country
        this.convertUnixToLocalTime(this.forecast.list[0].dt), // time
        this.forecast.list[0].weather[0].description, // description
        this.forecast.list[0].weather[0].icon, // icon
        this.forecast.list[0].main.temp, // temperature
      ];

      return {city, country, time, description, iconCode, temperature};
    },

    temperature: function() {
      return `${Math.round(this.forecastNow.temperature)}°`;
    },

    temperatureForecast: function() {
      const thing = this.forecast.list.reduce((acc, item, index) => {
        const time = this.convertUnixToLocalTime(item.dt, 'ddd h:mma');
        const temp = Math.round(item.main.temp);

        acc.temps.push(temp);
        acc.times.push(index % 3 == 0 ? time : ` `);

        return acc;
      }, {temps: [], times: []});

      console.log('WOOF', thing)
      return thing;
    },
  },

  methods: {
    convertUnixToLocalTime(utime, format = 'h:mm a — dddd, Do MMM \'YY') {
      return moment.unix(utime).format(format);
    },

    forecastByCity() {
      const requestParams = `q=${this.searchCity}`;
      this.makeRequest(requestParams);
    },

    forecastByCoordinates(coordinates) {
      console.log('coordinates', coordinates);
      const lat = coordinates.coords.latitude;
      const lon = coordinates.coords.longitude;
      const requestParams = `lat=${lat}&lon=${lon}`;

      this.makeRequest(requestParams);
    },

    makeRequest(requestParams) {
      this.isLoading = true;
      this.error = false;
      this.errorMessages = [];

      const requestURL = `${this.baseURL}${requestParams}${this.units}${this.apiKey}`;

      return fetch(requestURL)
        .then(response => response.json())
        .then(response => {
          if(response.cod == '200') {
            this.forecast = response;
            this.searchCity = `${this.forecastNow.city}, ${this.forecastNow.country}`;
          } else {
            this.handleFetchError(response);
          }
        })
        .then(() => this.fetchIcon())
        .catch(error => console.error(error))
        .finally(() => this.isLoading = false);
    },

    fetchIcon() {
      this.isIconLoading = true;

      const iconCode = this.forecastNow.iconCode;
      const iconRequestURL = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

      return fetch(iconRequestURL)
        .then(icon => this.iconURL = icon.url)
        .finally(() => this.isIconLoading = false);
    },

    handleGeolocationError(error) {
      console.warn('Geolocation error', error.message);
      this.forecastByCity();
    },

    handleFetchError(error) {
      this.error = true;
      this.errorMessages = [error.message];
    }
  }
};
</script>
