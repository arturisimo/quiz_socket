'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));
var Schema = mongoose.Schema;

var QuizSchema = new Schema({
  quizId: Number,
  pregunta: {type: String, required: true },
  respuesta: {type: String, required: true },
  tema: {type: String, required: true },
  comments: [{type: Schema.Types.ObjectId, ref: 'Comment', required: true}],
  createdAt: Date,
  updatedAt: Date
});


QuizSchema.pre('save', function(next){
  var now = new Date();
  this.updatedAt = now;
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
  next();
});

module.exports = mongoose.model('Quiz', QuizSchema);