'use strict'

const config = require('./config.json');
const setup = require('./lib/setup');
const uuidv4 = require('uuid/v4');


if(!process.env.VALID_KEY) {

    process.env.VALID_KEY = uuidv4();
    process.env.SUSPENDED_KEY = uuidv4();
    console.log("valid API key for this test: " + process.env.VALID_KEY);
    console.log("suspended API key for this test: " + process.env.SUSPENDED_KEY + "\n\n");

    process.env.IP2GEO_AWS_REGION = config.IP2GEO_AWS_REGION;
    process.env.IP2GEO_KEYSPACE = config.IP2GEO_KEYSPACE;
    process.env.IP2ASN_KEYSPACE = config.IP2ASN_KEYSPACE;
    process.env.SOURCE_IP = config.SOURCE_IP;
    process.env.IPV4_IP = config.IPV4_IP;
    process.env.IPV6_IP = config.IPV6_IP;
    process.env.STRIPE_PRIVATE_KEY = config.STRIPE_PRIVATE_KEY;
    process.env.STRIPE_MVP_PLAN = config.STRIPE_MVP_PLAN;
    process.env.STRIPE_BOOTSTRAP_PLAN = config.STRIPE_BOOTSTRAP_PLAN;
    process.env.STRIPE_STARTUP_PLAN = config.STRIPE_STARTUP_PLAN;
    process.env.STRIPE_GROWTH_PLAN = config.STRIPE_GROWTH_PLAN;
    process.env.POSTMARK_API_KEY = config.POSTMARK_API_KEY;
    process.env.CREATE_ACCOUNT_SNS_TOPIC = config.CREATE_ACCOUNT_SNS_TOPIC;
    process.env.CREATE_ACCOUNT_FUNCTION_NAME = config.CREATE_ACCOUNT_FUNCTION_NAME;
    process.env.AWS_SDK_LOAD_CONFIG = true; // tells aws sdk to load region from ~/.aws/config and credentials from ~/.aws/credentials

    setup.run( function (err) {
        if(err){
            return err;
        }
        else{
            return null;
        }
    });
}
