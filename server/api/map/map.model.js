'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MapSchema = new Schema({
  house_number: String,
  suburb: String,
  road: String,
  postcode: String,
  country: String,
  country_code: String,
  city: String,
  description: String
});


module.exports = mongoose.model('Map', MapSchema);

