const Sequelize = require('sequelize');

const connection = new Sequelize('guiapress', 'root', 'DatabaseSQL', {
    host: 'localhost',
    dialect: 'mysql',
    timezone: '-03:00'
});

module.exports = connection;
