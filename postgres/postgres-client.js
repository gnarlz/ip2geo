'use strict';

const {Client} = require('pg');
let client;

client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: process.env.POSTGRES_DB
});
client.connect(err => {
    if (err) {
        console.error('postgres connection error', err.stack);
    } else {
        console.log('postgres connected');
    }
});



module.exports = client;



