# thinkific-weather

A simple Vue.js app to display a city's weather data using the OpenWeather api.

[I'm hosting this app on Firebase.](https://thinkific-weather-46479.firebaseapp.com)

## Instructions
1. To display another city's weather information you can change the current city name and hit `enter`.
2. To toggle between Celsius and Fahrenheit click the badge/icon beside the main temperature reading.

---

Note: It'd be great if I obfuscated the queries to the OpenWeather api since I'm sending my api along with the other query parameters but this project's just a frontend thing. Maybe I'd use a key-store service or something like that? But, like I mentioned, the key's still sent in the URL.

Perhaps with Firebase functions or AWS lambda? _Perhaps_, but who has that kind of time?

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
