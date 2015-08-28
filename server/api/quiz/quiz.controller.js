/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/quizzes              ->  index
 * POST    /api/quizzes              ->  create
 * GET     /api/quizzes/:id          ->  show
 * PUT     /api/quizzes/:id          ->  update
 * DELETE  /api/quizzes/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Quiz = require('./quiz.model');
var mongoose = require('mongoose');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.log(err.message);
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(function(updated) {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(function() {
          res.status(204).end();
        });
    }
  };
}

// Gets a list of Quizzes
exports.index = function(req, res) {
  Quiz.find()
    .sort({createdAt:1})
    .populate("comments")
    .execAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));  
};

exports.show = function(req, res) {
  Quiz.findOne({quizId: req.params.id})
    .populate("comments")
    .execAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));  
};

// Creates a new Quiz in the DB
exports.create = function(req, res) {

  Quiz.findOne().select('quizId').sort({quizId:-1}).then(function(quizLast){
    req.body.quizId = quizLast.quizId+1;
    Quiz.createAsync(req.body)
      .then(responseWithResult(res, 201))
      .catch(handleError(res));

  }); 
   
};

// Updates an existing Quiz in the DB
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Quiz.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Deletes a Quiz from the DB
exports.destroy = function(req, res) {
  Quiz.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
};

// search
exports.search = function(req, res) {
  var search = req.params.search;
  console.log('search'+search);
  Quiz.find({pregunta: new RegExp(search, "i")}).sort({createdAt:1}).populate('comments').execAsync(function (err, quizes) {
    if(err) { return handleError(res, err); }
    console.log(quizes);
    return res.status(200).json(quizes);
  });
};