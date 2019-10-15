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
            v-bind:hint="firstForecast.time"
            v-bind:error="error"
            v-bind:error-messages="errorMessages"
          ></v-text-field>

        </div>

        <div class="temperature mt-12 pt-12">
          <h1 class="display-4">
            {{ firstForecast.temperature }}

            <v-badge color="blue lighten-3">
              <template v-slot:badge>
                <v-icon small @click="changeUnits">
                  {{ isMetric ? 'mdi-temperature-fahrenheit' : 'mdi-temperature-celsius'}}
                </v-icon>
              </template>

              <sup class="display-3 font-weight-light">
                {{ temperatureUnits }}
              </sup>
            </v-badge>
          </h1>

         <v-flex class="weather-description d-inline-flex align-center">
            <v-img v-if="iconURL"
              :src=iconURL
              contain
              max-height="50"
              max-width="50"
            ></v-img>

            <span class="subheading font-weight-regular">
              {{ firstForecast.description }}
            </span>
         </v-flex>
        </div>

        <v-flex class="additional-information mb-6">
          <v-container fluid>
            <v-row dense>

              <v-col cols="1" v-for="(card, i) in firstForecastCards" :key="i">
                <v-card outlined>
                  <v-list-item three-line>
                    <v-list-item-content>

                      <div class="overline mb-4">{{ card.title }}</div>

                      <v-list-item-title class="headline mb-1">
                        {{ card.value }}
                      </v-list-item-title>

                      <v-list-item-subtitle>
                        {{ card.subtitle }}
                      </v-list-item-subtitle>

                    </v-list-item-content>
                  </v-list-item>
                </v-card>
              </v-col>

            </v-row>
          </v-container>
        </v-flex>

        <v-divider></v-divider>

        <v-timeline align-top :dense="$vuetify.breakpoint.smAndDown" v-if="forecastTimeline">
          <v-timeline-item
            v-for="(item, i) in forecastTimeline"
            :key="i"
            :color="item.color"
            :icon="item.icon"
            :small=true
          >
            <span slot="opposite">{{ convertUnixToLocalTime(item.dt) }}</span>
            <v-card :color="item.color" dark>
              <v-card-title class="title">{{ Math.round(item.main.temp) }}° —  {{ item.weather[0].description }}</v-card-title>
              <v-card-text>
                <p>{{ item.weather[0].description }}</p>
              </v-card-text>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </v-flex>

    </v-layout>

    <v-overlay :value="isLoading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script>
import moment from 'moment';

// TODO: Should be extracted from environment, ugh
const OPENWEATHER_API_KEY  = '8892e2d93e33cc9aaa8d85e5a6ee11bc';

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

    baseURL: 'https://api.openweathermap.org/data/2.5/forecast?',

    description: null,

    error: false,

    errorMessages: [],

    forecast: null,

    forecastTimeline: null,

    iconURL: null,

    isLoading: false,

    isIconLoading: false,

    searchCity: 'Vancouver,ca',

    isMetric: true,
  }),

  computed: {
    apiKey: function() {
      return `&appid=${OPENWEATHER_API_KEY}`;
    },

    firstForecast: function() {
      const [
        city,
        country,
        time,
        description,
        iconCode,
        temperature,
        maxTemp,
        minTemp,
        clouds
      ] = this.extractFirstForecast();

      return {city, country, time, description, iconCode, temperature, maxTemp, minTemp, clouds};
    },

    firstForecastCards() {
      const forecast = this.firstForecast;
      const unit = this.temperatureUnits;

      return [
        {title: 'MAX', subtitle: unit, value: forecast.maxTemp},
        {title: 'MIN', subtitle: unit, value: forecast.minTemp},
        {title: 'CLOUDS', subtitle: '%', value: forecast.clouds},
      ];
    },

    temperatureUnits: function() {
      return this.isMetric ? 'C' : 'F';
    },

    units: function() {
      return this.isMetric ? 'metric' : 'imperial';
    },

    unitsQuery: function() {
      return `&units=${this.units}`;
    },
  },

  methods: {
    changeUnits() {
      this.isMetric = !this.isMetric;
      this.forecastByCity();
    },

    convertUnixToLocalTime(utime, format = 'h:mm a — dddd, Do MMM \'YY') {
      return moment.unix(utime).format(format);
    },

    extractFirstForecast() {
      const firstForecast = this.forecast.list[0];
      const weather = firstForecast.weather[0];

      return [
        this.forecast.city.name, // city
        this.forecast.city.country, // country
        this.convertUnixToLocalTime(firstForecast.dt), // time
        weather.description, // description
        weather.icon, // icon
        `${Math.round(firstForecast.main.temp)}°`, // temperature
        `${Math.round(firstForecast.main.temp_max)}°`, // max temp
        `${Math.round(firstForecast.main.temp_min)}°`, // min temp
        firstForecast.clouds.all, // clouds
      ];
    },

    forecastByCity() {
      const requestParams = `q=${this.searchCity}`;
      this.makeRequest(requestParams);
    },

    forecastByCoordinates(coordinates) {
      const lat = coordinates.coords.latitude;
      const lon = coordinates.coords.longitude;
      const requestParams = `lat=${lat}&lon=${lon}`;

      this.makeRequest(requestParams);
    },

    makeRequest(requestParams) {
      this.handleRequestStart();

      const requestURL = `${this.baseURL}${requestParams}${this.unitsQuery}${this.apiKey}`;

      return fetch(requestURL)
        .then(response => response.json())
        .then(response => {
          response.cod == '200' ?
            this.handleRequestSuccess(response) :
            this.handleRequestError(response);
        })
        .then(() => this.fetchIcon(this.firstForecast.iconCode))
        .catch(error => console.error(error))
        .finally(() => this.isLoading = false);
    },

    fetchIcon(iconCode) {
      const iconRequestURL = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

      return fetch(iconRequestURL).then(icon => this.iconURL = icon.url);
    },

    handleGeolocationError(error) {
      console.warn('Geolocation error', error.message);
      this.forecastByCity();
    },

    handleRequestStart() {
      this.isLoading = true;
      this.error = false;
      this.errorMessages = [];
    },

    handleRequestSuccess(response) {
      this.forecast = response;
      this.forecastTimeline = response.list;
      this.searchCity = `${this.firstForecast.city}, ${this.firstForecast.country}`;
    },

    handleRequestError(error) {
      this.error = true;
      this.errorMessages = [error.message];
    }
  }
};
</script>
