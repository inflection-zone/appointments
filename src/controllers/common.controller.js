const path = require('path')
const fs = require('fs')
const config = require('../config/config.js')

module.exports.ping = async (request, response) => {
    response.json({ success: true, message: 'pong' })
    return
}
