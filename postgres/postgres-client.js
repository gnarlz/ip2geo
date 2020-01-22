'use strict';

const {Client } = require('pg');


const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: process.env.POSTGRES_DB
})


// localhost
/*
const client = new Client({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'ip2geo',
    port: 5432,
})
*/


client.connect(err => {
    if (err) {
        console.error('postgres connection error', err.stack)
    } else {
        console.log('postgres connected')
    }
});


module.exports = client;



