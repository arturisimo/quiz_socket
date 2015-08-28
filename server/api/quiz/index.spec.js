'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var quizCtrlStub = {
  index: 'quizCtrl.index',
  show: 'quizCtrl.show',
  create: 'quizCtrl.create',
  update: 'quizCtrl.update',
  destroy: 'quizCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var quizIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './quiz.controller': quizCtrlStub
});

describe('Quiz API Router:', function() {

  it('should return an express router instance', function() {
    quizIndex.should.equal(routerStub);
  });

  describe('GET /api/quizzes', function() {

    it('should route to quiz.controller.index', function() {
      routerStub.get
                .withArgs('/', 'quizCtrl.index')
                .should.have.been.calledOnce;
    });

  });

  describe('GET /api/quizzes/:id', function() {

    it('should route to quiz.controller.show', function() {
      routerStub.get
                .withArgs('/:id', 'quizCtrl.show')
                .should.have.been.calledOnce;
    });

  });

  describe('POST /api/quizzes', function() {

    it('should route to quiz.controller.create', function() {
      routerStub.post
                .withArgs('/', 'quizCtrl.create')
                .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/quizzes/:id', function() {

    it('should route to quiz.controller.update', function() {
      routerStub.put
                .withArgs('/:id', 'quizCtrl.update')
                .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/quizzes/:id', function() {

    it('should route to quiz.controller.update', function() {
      routerStub.patch
                .withArgs('/:id', 'quizCtrl.update')
                .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/quizzes/:id', function() {

    it('should route to quiz.controller.destroy', function() {
      routerStub.delete
                .withArgs('/:id', 'quizCtrl.destroy')
                .should.have.been.calledOnce;
    });

  });

});
