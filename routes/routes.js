module.exports = (app) => {
  const router = require('express').Router();
  const bikeController = require('../controllers/bike.controller.js');
  router.get('/links', bikeController.getLinks);
  router.get('/bikes', bikeController.getBikes);

  app.use('/', router);
};
