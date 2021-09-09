'use strict'

const AWS = require('aws-sdk')
const postmark = require("postmark")
const winston = require('winston')
const logger = winston.createLogger({transports: [new winston.transports.Console()]})

const sendNewSubscriberEmail = async (accountData, requestId) => {
    logger.log({requestId, level: 'info', message: `account.sendNewSubscriberEmail - accountData: ${JSON.stringify(accountData)}`})

    return Promise.all([getHtmlContent(accountData, requestId), getTextContent(accountData, requestId)])
        .then((htmlContent, textContent) => {
            return sendEmail(accountData, htmlContent, textContent, requestId)
        })
        .catch((error) => {
            logger.log({requestId, level: 'error',  message: `account.sendNewSubscriberEmail - error sending email for account: ${JSON.stringify(accountData)}   error: ${error}`})
            throw error
        })
        .then(() => {
            return null
        })
}

const getHtmlContent = async (accountData, requestId) => {
    const html_params = {
        Bucket: process.env.HTML_TEMPLATE_BUCKET_NAME,
        Key: process.env.HTML_TEMPLATE_KEY_NAME
    }
    const s3GetObjectPromise = new AWS.S3().getObject(html_params).promise()

    return s3GetObjectPromise
    .then((data) => {
        let template = data.Body.toString('ascii')
        let html_plan_display_name_replacement = template.replace(/{{plan_display_name}}/, accountData.display_name )
        let html_monthly_limit_replacement = html_plan_display_name_replacement.replace(/{{monthly_limit}}/,  Number(accountData.limit).toLocaleString() )
        let html_rate_limit_details_replacement = html_monthly_limit_replacement.replace(/{{rate_limit_details}}/, '')
        let htmlTemplate = html_rate_limit_details_replacement.replace(/{{key}}/, accountData.key)
        return htmlTemplate
    })
    .catch((error) => {
        logger.log({requestId, level: 'error',  message: `account.getHtmlContent - error: ${error}`})
        throw error
    })
}

const getTextContent = async (accountData, requestId) =>{
    const text_params = {
        Bucket: process.env.TEXT_TEMPLATE_BUCKET_NAME,
        Key: process.env.TEXT_TEMPLATE_KEY_NAME
    }
    const s3GetObjectPromise = new AWS.S3().getObject(text_params).promise()
    return s3GetObjectPromise
    .then((data) => {
        let template = data.Body.toString('ascii')
        let text_plan_display_name_replacement = template.replace(/{{plan_display_name}}/, accountData.display_name)
        let text_monthly_limit_replacement = text_plan_display_name_replacement.replace(/{{monthly_limit}}/, Number(accountData.limit).toLocaleString())
        let text_rate_limit_details_replacement = text_monthly_limit_replacement.replace(/{{rate_limit_details}}/, '')
        let textTemplate = text_rate_limit_details_replacement.replace(/{{key}}/, accountData.key)
        return textTemplate
    })
    .catch((error) => {
        logger.log({requestId, level: 'error',  message: `account.getTextContent - error: ${error}`})
        throw error
    })
}

const sendEmail = async (accountData, htmlContent, textContent, requestId) => {
    const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY)
    // TODO: sign up for new postmark account and integrate back into the stack
    
    const message = {
        From: "support@ip2geo.co",
        To: accountData.email,
        Cc: "support@ip2geo.co",
        ReplyTo: "support@ip2geo.co",
        Subject: "Welcome to ip2geo! Here is your API key",
        HtmlBody: "'" + htmlContent + "'",
        TextBody: textContent,
        TrackOpens: true,
        TrackLinks: "HtmlOnly"
    }
    return client.sendEmail(message)
    .then((data) => {
        logger.log({requestId, level: 'info',  message: `account.sendEmail - success for accountData: ${JSON.stringify(accountData)} - ${data}`})
        return null
    })
    .catch((error) => {
        logger.log({requestId, level: 'error',  message: `account.sendEmail - error: ${error}`})
        throw error
    })
    
}

module.exports = { sendNewSubscriberEmail, getHtmlContent, getTextContent, sendEmail}