'use strict'

const moment = require('moment')
const _ = {
    isEmpty: require('lodash.isempty')
  }

const isnumeric = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n)
}

const setResponseHeadersCORS = (response) => {
    response.headers = {
        "X-Requested-With": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    }
}

const enrichRequest = (event, context) => {
    const request = {}
    request.request_id = context.awsRequestId
    request.request_ts = moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS')
    request.source_ip = (!_.isEmpty(event))? event['requestContext']['identity']['sourceIp'] : null
    request.is_desktop = (!_.isEmpty(event))? (event['headers']['CloudFront-Is-Desktop-Viewer'] === "true") : null
    request.is_mobile = (!_.isEmpty(event))? (event['headers']['CloudFront-Is-Mobile-Viewer'] === "true"): null
    request.is_smart_tv = (!_.isEmpty(event))? (event['headers']['CloudFront-Is-SmartTV-Viewer'] === "true"): null
    request.is_tablet = (!_.isEmpty(event))? (event['headers']['CloudFront-Is-Tablet-Viewer'] === "true"): null
    request.viewer_country = (!_.isEmpty(event))? event['headers']['CloudFront-Viewer-Country']: null
    request.accept_language = (!_.isEmpty(event))? event['headers']['Accept-Language']: null
    request.origin = (!_.isEmpty(event))? event['headers']['origin']: null
    request.referer = (!_.isEmpty(event))? event['headers']['Referer']: null
    request.user_agent = (!_.isEmpty(event))? event['headers']['User-Agent']: null
    return request
}

module.exports = {isnumeric,setResponseHeadersCORS, enrichRequest}