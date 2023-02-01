const path = require('path')
const fs = require('fs')
let cron = require('node-cron')

const config = require('../config/config.js')

console.log('Enabling Cron process for TikMe.')

/*
 * Test cron running every min
 * doc: https://www.npmjs.com/package/node-cron
 */
// MIN HOUR DOM MON DOW
cron.schedule('* * * * *', () => {
    var time = new Date().toString()
    console.log('------------------------- Test Cron Execution... -------------------------')
    console.log('TIME: [' + time + ']')
    console.log('TikME is up ____ running a task every minute.')
})

