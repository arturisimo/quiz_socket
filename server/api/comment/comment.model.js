'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  nombre: String,
  comentario: {type: String, required: true },
  site: String,
  idQuiz: {type: Schema.Types.ObjectId, ref: 'Quiz', required: true},
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
});

CommentSchema.path('site').validate(function (site) {
   var siteRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
   return siteRegex.test(site.text);
}, 'El formato de la página web no es correcto.')


CommentSchema.pre('save', function(next){
  var now = new Date();
  this.updatedAt = now;
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
  next();
});

module.exports = mongoose.model('Comment', CommentSchema);