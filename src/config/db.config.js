"use strict"

const Sequelize = require('sequelize')
const fs = require('fs')
const path = require('path')

const config = require('./config.js')

const db = {}

const sequelize = new Sequelize(
    config.DB_NAME,
    config.DB_USER,
    config.DB_PASS,
    {
        host: config.DB_HOST,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
)

// test the connection
sequelize.authenticate().then(function(err) {
    console.log('Database Connection has been established successfully.')
}).catch(function (err) {
    console.log('Unable to connect to the database:', err)
})

//  Sequalize Datatype guide
// https://sequelize.readthedocs.io/en/latest/docs/models-definition/

fs.readdirSync(__dirname + '/../models/entities').filter(function(file) {
    return (file.indexOf(".js") !== -1) && (file !== "index.js")
}).forEach(function(file) {
    const model = sequelize.import(path.join(__dirname, '/../models/entities/', file))
    db[model.name] = model
});

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
      db[modelName].associate(db)
    }
})

db.Sequelize = Sequelize
db.sequelize = sequelize

module.exports = db
