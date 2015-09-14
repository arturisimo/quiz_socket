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
  	description: String,
	lng: {type: Number, required: true } ,
	lat: {type: Number, required: true },
	createdAt: Date,
  	updatedAt: Date
});

MapSchema.pre('save', function(next){
  var now = new Date();
  this.updatedAt = now;
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
  next();
});


module.exports = mongoose.model('Map', MapSchema);

