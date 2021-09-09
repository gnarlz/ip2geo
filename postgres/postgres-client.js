'use strict'

const {Client} = require('pg')
let client

const postgresOpts = {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER? process.env.POSTGRES_USER : "ip2geo",
    password: process.env.POSTGRES_PASS? process.env.POSTGRES_PASS : "kzsu666",
    database: process.env.POSTGRES_DB? process.env.POSTGRES_DB : "ip2geo"
}

if (!(process.env.NODE_ENV && process.env.NODE_ENV === 'unit')){
    console.log(`postgresOpts: ${JSON.stringify(postgresOpts,null,2)}`) // connects to local postgres if opts empty
    client = new Client(postgresOpts)

    client.connect(err => {
        if (err) {
            console.error(err)
            console.error('postgres connection error', err.stack)
        } else {
            console.log('postgres client - connected')
        }
    })
}

module.exports = client



