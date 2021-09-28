'use strict'

const AWS = require('aws-sdk')
const postmark = require('postmark')
const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })

const sendNewSubscriberEmail = async (accountData, requestId) => {
  logger.log({ requestId, level: 'info', src: 'account.sendNewSubscriberEmail',  accountData })

  return Promise.all([getHtmlContent(accountData, requestId), getTextContent(accountData, requestId)])
    .then((htmlContent, textContent) => {
      return sendEmail(accountData, htmlContent, textContent, requestId)
    })
    .catch((error) => {
      logger.log({ requestId, level: 'error', src: 'account.sendNewSubscriberEmail', message: 'error sending email for account', accountData, error: error.message })
      throw error
    })
}

const getHtmlContent = async (accountData, requestId) => {
  const htmlParams = {
    Bucket: process.env.HTML_TEMPLATE_BUCKET_NAME,
    Key: process.env.HTML_TEMPLATE_KEY_NAME
  }
  const s3GetObjectPromise = new AWS.S3().getObject(htmlParams).promise()

  return s3GetObjectPromise
    .then((data) => {
      const template = data.Body.toString('ascii')
      const htmlPlanDisplayNameReplacement = template.replace(/{{plan_display_name}}/, accountData.display_name)
      const htmlMonthlyLimitReplacement = htmlPlanDisplayNameReplacement.replace(/{{monthly_limit}}/, Number(accountData.limit).toLocaleString())
      const htmlRateLimitDetailsReplacement = htmlMonthlyLimitReplacement.replace(/{{rate_limit_details}}/, '')
      const htmlTemplate = htmlRateLimitDetailsReplacement.replace(/{{key}}/, accountData.key)
      return htmlTemplate
    })
    .catch((error) => {
      logger.log({ requestId, level: 'error', src: 'account.getHtmlContent', error: error.message })
      throw error
    })
}

const getTextContent = async (accountData, requestId) => {
  const textParams = {
    Bucket: process.env.TEXT_TEMPLATE_BUCKET_NAME,
    Key: process.env.TEXT_TEMPLATE_KEY_NAME
  }
  const s3GetObjectPromise = new AWS.S3().getObject(textParams).promise()
  return s3GetObjectPromise
    .then((data) => {
      const template = data.Body.toString('ascii')
      const textPlanDisplayNameReplacement = template.replace(/{{plan_display_name}}/, accountData.display_name)
      const textMonthlyLimitReplacement = textPlanDisplayNameReplacement.replace(/{{monthly_limit}}/, Number(accountData.limit).toLocaleString())
      const textRateLimitDetailsReplacement = textMonthlyLimitReplacement.replace(/{{rate_limit_details}}/, '')
      const textTemplate = textRateLimitDetailsReplacement.replace(/{{key}}/, accountData.key)
      return textTemplate
    })
    .catch((error) => {
      logger.log({ requestId, level: 'error', src: 'account.getTextContent', error: error.message })
      throw error
    })
}

const sendEmail = async (accountData, htmlContent, textContent, requestId) => {
  const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY)

  const message = {
    From: 'support@ip2geo.co',
    To: accountData.email,
    Cc: 'support@ip2geo.co',
    ReplyTo: 'support@ip2geo.co',
    Subject: 'Welcome to ip2geo! Here is your API key',
    HtmlBody: "'" + htmlContent + "'",
    TextBody: textContent,
    TrackOpens: true,
    TrackLinks: 'HtmlOnly'
  }
  return client.sendEmail(message)
    .then((data) => {
      logger.log({ requestId, level: 'info', src: 'account.sendEmail',  message: 'successfiully sent email', accountData })
      return null
    })
    .catch((error) => {
      logger.log({ requestId, level: 'error', src: 'account.sendEmail', error: error.message })
      throw error
    })
}

module.exports = { sendNewSubscriberEmail, getHtmlContent, getTextContent, sendEmail }
