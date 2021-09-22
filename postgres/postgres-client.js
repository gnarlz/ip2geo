'use strict'

const { Client } = require('pg')
const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })

/* istanbul ignore next */
const postgresOpts = {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER ? process.env.POSTGRES_USER : 'ip2geo',
  password: process.env.POSTGRES_PASS ? process.env.POSTGRES_PASS : 'kzsu666',
  database: process.env.POSTGRES_DB ? process.env.POSTGRES_DB : 'ip2geo'
}

let client
/* istanbul ignore next */
if (process.env.NODE_ENV !== 'unit') {
  logger.log({ level: 'info', message: `postgres-client - opts: ${JSON.stringify(postgresOpts, null, 2)}` })
  const client = new Client(postgresOpts)

  client.connect(err => {
    if (err) {
      logger.log({ level: 'error', message: `postgres-client - error: ${err}` })
    } else {
      logger.log({ level: 'info', message: 'postgres-client - connected' })
    }
  })
}

module.exports = client
