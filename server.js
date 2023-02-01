const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const helmet = require('helmet')
const logger = require('morgan')

const app = express()

// loading global application configuration variables
const config = require('./src/config/config.js')
// load DB connection to sync schema
const db = require('./src/config/db.config.js')

global.__basedir = __dirname

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// path to public resources - js/css/fonts/images etc
app.use(express.static('public'))

// for better security
app.use(helmet())


// logger
app.use(logger('[:date] :method :url :status - :response-time ms'))

// logging some info for better debugging
app.use(function (request, _response, next) {
    console.log("-------------------------------------------------------------------------")
    console.log("URL hit:: ", request.originalUrl)
    if(process.ENVIRONMENT == 'DEVELOPMENT') {
        var reqStr = JSON.stringify(request, null, 2);
        var resStr = JSON.stringify(_response, null, 2);
        console.log('request:' + reqStr);
        console.log('response:' + resStr);
    }
    next()
})

// all templates are located in `src/views` directory
app.set('views', path.join(__dirname, 'src/views'))
// here you set that you're using `ejs` template engine, and the default extension is `ejs`
app.set('view engine', 'ejs')

// All routing mechanism goes here
const routes = require('./src/routes/route.js')
app.use('/', routes)

app.use(function (request, response, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
})

// error handler
// no stacktraces leaked to user unless in development environment
app.use(function (err, request, response, next) {
    console.log("API Error occurred:", err.stack)
    response
        .status(err.status || 500)
        .json({ success: false, message: err.message, data: (config.ENVIRONMENT === 'DEVELOPMENT') ? err : null })
})

// Create a DB Sync & then Server
db.sequelize.sync({ force: false }).then(function () {
    console.log('New tables created into DB...')
    console.log('-----------------------------')
    console.log("Loaded global API key: ", config.GLOBAL_API_KEY)

    var server = app.listen(config.PORT, function () {
        var host = server.address().address
        var port = server.address().port
        console.log("Application listening at ", host, ":", port)
        console.log("Application ENVIRONMENT: ", config.ENVIRONMENT)
        console.log('------------------ Server started -------------------------')
    })
})