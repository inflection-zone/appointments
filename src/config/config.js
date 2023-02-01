/*
 * Place .env file in root directory and add below values
 * .env configurations will override default values
 * Docs: https://www.npmjs.com/package/dotenv
*/
const config = require('dotenv').config()

// if there is no dotenv file - default creds to local env
if (config.error) {
    config.parsed = {
        ENVIRONMENT: 'DEVELOPMENT',
        HOST: 'http://localhost',
        PORT: '3000',
        DB_NAME: 'appointment_service', // CREATE SCHEMA `appointment_service` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        DB_USER: 'root',
        DB_PASS: '123456',
        DB_HOST: 'host.docker.internal',
        GLOBAL_API_KEY: 'tikme-ZzkaRSnHixeTfc38lJGBeQmFMGXJTsSz'
    }
}

// Any static config applicable for ALL environments - goes here
// config.parsed.SOME_CONFIG = 'SOME_VALUE'

module.exports = config.parsed
