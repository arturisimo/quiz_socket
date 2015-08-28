'use strict';

var express = require('express');
var controller = require('./quiz.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id(\\d+)', controller.show);
router.get('/search/:search', controller.search);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
