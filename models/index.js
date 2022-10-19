const dbConfig = require('../config/db.config.js');

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    dialect: dbConfig.dialect,
    host: dbConfig.host,
    port: dbConfig.port,
  }
);

const db = {
  Sequelize: Sequelize,
  sequelize: sequelize,
  bikes: require('./bike.model.js')(sequelize, Sequelize),
};

module.exports = db;
