'use strict'

const util = require('util')
const winston = require('winston')
const logger = winston.createLogger({transports: [new winston.transports.Console()]})

const redisClient = require('../redis/redis-client')
const postgresClient = require('../postgres/postgres-client')
let AWS = require('aws-sdk')





module.exports = {
   
    insertPostgresKeyAccount: (accountData) => {
        // TODO: refactotor with sql as tokens
        postgresClient.query("insert into key.account (key, subscription_id, plan_id, email, active, created_at," +
            " updated_at) values ('" +
            accountData.key + "', '" +
            accountData.subscription_id + "', '" +
            accountData.plan_name + "', '" +
            accountData.email + "', " +
            "true, now(), now())")
        .then(result => {
            logger.log({requestId, level: 'info', message: `account.create - inserted row into key.account    key: ${accountData.key} `})
            return
        })
        .catch(error => {
            logger.log({requestId, level: 'error', message: `account.create - error inserting into key.account    key: ${accountData.key}    error: ${error}`})
            throw error
        })
    },
    
    insertPostgresKeyRequest: (accountData) => {
        postgresClient.query("insert into key.request (key,total,created_at,updated_at) values ('" +
            accountData.key + "', 0, now(), now())")
        .then(result => {
            logger.log({requestId, level: 'info', message: `account.create - inserted row into key.request    key: ${accountData.key} `})
            return
        })
        .catch(error => {
            logger.log({requestId, level: 'error', message: `account.create - error inserting into key.request    key: ${accountData.key}    error: ${error}`})
            throw error
        })
    },
    
    insertPostgresKeyLimit: (accountData) => {
        postgresClient.query("insert into key.limit (key,limit_,created_at,updated_at, ratelimit_max, " +
            "ratelimit_duration) values ('" +
            accountData.key + "', " +
            accountData.limit + ", now(), now()," +
            (accountData.ratelimit_max? accountData.ratelimit_max : null) + ", " +
            (accountData.ratelimit_duration? accountData.ratelimit_duration : null) + ")")
        .then(result => {
            logger.log({requestId, level: 'info', message: `account.create - inserted row into key.limit    key: ${accountData.key} `})
            return
        })
        .catch(error => {
            logger.log({requestId, level: 'error', message: `account.create - error inserting into key.limit    key: ${accountData.key}    error: ${error}`})
            throw error
        }) 
    },
    
    insertPostgresKeyAuthorization: (accountData) => {
        postgresClient.query("insert into key.authorization (key,authorized,created_at,updated_at, ratelimit_max, " +
            "ratelimit_duration, message) values ('" +
            accountData.key + "', true,  now(), now()," +
            (accountData.ratelimit_max? accountData.ratelimit_max : null) + ", " +
            (accountData.ratelimit_duration? accountData.ratelimit_duration : null) + ", '" + "Account creation" + "')")
        .then(result => {
            logger.log({requestId, level: 'info', message: `account.create - inserted row into key.authorization    key: ${accountData.key} `})
            return
        })
        .catch(error => {
            logger.log({requestId, level: 'error', message: `account.create - error inserting into key.authorization    key: ${accountData.key}    error: ${error}`})
            throw error
        })
    
    },
    
    insertRedisAuthorization: (accountData) => {
        const akey = "authorized:" + accountData.key
        const redis_row = {}
        redis_row.authorized = true
        redis_row.message = 'Account created.'
        redis_row.ts = accountData.ts
        if(accountData.ratelimit_max){
            redis_row.ratelimit_max = accountData.ratelimit_max
        }
        if(accountData.ratelimit_duration){
            redis_row.ratelimit_duration = accountData.ratelimit_duration
        }
        redis_row.status = "success"

        const args = [akey, JSON.stringify(redis_row)]
        const redisClientSendCommand = util.promisify(redisClient.send_command).bind(redisClient)
        return redisClientSendCommand('SET', args)
        .then(() => {
            logger.log({requestId, level: 'info', message: `account.create - set authorization in redis    key: ${akey}`})
            return
        })
        .catch((error) => {
            logger.log({requestId, level: 'error', message: `account.create - error attempting to set authorization in redis    key: ${akey}    error: ${error}`})
            throw error
        })
    },
    
    
    sendAccountCreationTextAndEmail: (accountData) => {
        AWS.config.region = process.env.IP2GEO_AWS_REGION
        const params = {
            Message: JSON.stringify(accountData),
            TopicArn: process.env.CREATE_ACCOUNT_SNS_TOPIC,
        }
        const snsPublishPromise = new AWS.SNS().publish(params).promise()
    
        snsPublishPromise
        .then( (data) => {
            logger.log({requestId, level: 'info', message: `SNS message ${params.Message} sent to the topic ${params.TopicArn} with MessageID ${data.MessageId}`})
            return
        })
        .catch((error) => {
            logger.log({requestId, level: 'error', message: `account.sendAccountCreationTextAndEmail - failed to send sns    accountData: ${accountData}    error: ${error}`})
            return // throw this error on the floor - its annoying but not life threatening
        })
    
    }
}

