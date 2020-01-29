'use strict';

const {Client} = require('pg');
let client;

if(process.env.POSTGRES_HOST){

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

} else{

    client = new Client({
        host: 'rajje.db.elephantsql.com',
        port: 5432,
        user: 'rsljwbtb',
        password: '5msxh2vbFCiYqSMXNfBsQfOuIRkfAH1d',
        database: 'rsljwbtb',
    });

    client.connect(err => {
        if (err) {
            console.error('elephantsql connection error', err.stack);
        } else {
            console.log('elephantsql connected');
        }
    });

}

module.exports = client;



