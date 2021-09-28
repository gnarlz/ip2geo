'use strict'

const { Client } = require('pg')
const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })

/* istanbul ignore next */
if (process.env.NODE_ENV === 'int') {
  const config = require('../test/integration/config')
  config.run()
}

const postgresOpts = {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASS,
  database: process.env.POSTGRES_DB
}

let client

/* istanbul ignore next */
if (process.env.NODE_ENV !== 'unit') {
  // logger.log({ level: 'info', src: 'redis/redis-client', opts })

  client = new Client(postgresOpts)
  client.connect(err => {
    if (err) {
      logger.log({ level: 'error', src: 'postgres/postgres-client', message: 'error', error: err.message })
    } else {
      logger.log({ level: 'info', src: 'postgres/postgres-client', message: 'connected' })
    }
  })
}

module.exports = client
