'use strict';
// Express
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
client.on('error', error => { throw error; });
// initialize a server
const server = express();
// Cross Origin Resource Sharing
const cors = require('cors');
server.use(cors()); // give access
// get all environment variable you need
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const DARKSKY_API_KEY = process.env.DARKSKY_API_KEY;
const EVENTFUL_API_KEY = process.env.EVENTFUL_API_KEY;
// Make the app listening
server.listen(PORT, () => console.log(' hello Listening at port 3000'));
server.get('/', (request, response) => {
  response.status(200).send('Lets Rock !!');
});
// first step just like event listener
server.get('/location', locationHandler);
// cons function
function Location(city, locationData) {
  this.formatted_query = locationData[0].display_name;
  this.latitude = locationData[0].lat;
  this.longitude = locationData[0].lon;
  this.search_query = city;
}
//where the magic happend...
function locationHandler(request, response) {
  // Read the city from the user (request) and respond
  let city = request.query['city'];
  client;
  getLocationData(city)
    .then((data) => {
      response.status(200).send(data);
    });
  // let sql = `SELECT city FROM information ;`;
  // console.log(client.query(sql));
  // console.log('insidehandler');
  // let print = `INSERT INTO information(city) VALUES('${city}')`;
  // if (client.query(sql)) {
  //   console.log(client.sql);
  //   console.log('true');
  //   response.status(200).send(sql);
  //   console.log('true');
  // } else {
  //   console.log('false');
  //   getLocationData(city)
  //     .then((data) => {
  //       client.print;
  //       response.status(200).send(data);
  //     });
  // }
}
function getLocationData(city) {
  const url = `https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json&limit=1`;
  // Superagent
  return superagent.get(url)
    .then((data) => {
      let location = new Location(city, data.body);
      return location;
    });
}
// first step , just to make our code cleaner
server.get('/weather', weatherHandler);
// the costructor function
function Weather(day) {
  this.time = new Date(day.time * 1000).toDateString();
  this.forecast = day.summary;
}
function weatherHandler(request, response) {
  let lat = request.query['latitude'];
  let lng = request.query['longitude'];
  getWeatherData(lat, lng)
    .then((data) => {
      response.status(200).send(data);
    });
}
function getWeatherData(lat, lng) {
  const url = `https://api.darksky.net/forecast/${DARKSKY_API_KEY}/${lat},${lng}`;
  return superagent.get(url)
    .then((weatherData) => {
      //   console.log(weatherData.body.daily.data);
      let weather = weatherData.body.daily.data.map((day) => new Weather(day));
      return weather;
    });
}
/////////////////////////// test
server.get('/events', eventHandler);
function Event(day) {
  this.link = day.url;
  this.name = day.title;
  this.eventDate = day.start_time;
  this.summary = day.description;
}
function eventHandler(request, response) {
  let lat = request.query['latitude'];
  let lng = request.query['longitude'];
  getEventData(lat, lng)
    .then((data) => {
      response.status(200).send(data);
    });
}
function getEventData(lat, lng) {
  const url = `http://api.eventful.com/json/events/search?app_key=${EVENTFUL_API_KEY}&q=amman&${lat},${lng}`;
  // console.log(url);
  return superagent.get(url)
    .then((eventData) => {
      let dataBase = JSON.parse(eventData.text);
      //   console.log(dataBase.events.event[0].description);
      let events = dataBase.events.event.map((day) => new Event(day));
      return events;
    });
}
// function startServer() {
// }
/////////////////////////// test
server.use('*', (request, response) => {
  response.status(404).send('Sorry, not found');
});
server.use((error, request, response) => {
  response.status(500).send(error);
});
// Start Up the Server after the database is connected and cache is loaded

client.on('error', err => console.error(err));
client.connect()
  .then(() =>{
    server.listen(PORT, () => console.log(`Server up on 3000`));
  });