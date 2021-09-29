'use strict'

const isIp = require('is-ip')
const ipInt = require('ip-to-int')
const bigInt = require('big-integer')
const http = require('http-codes')
const winston = require('winston')
const logger = winston.createLogger({ transports: [new winston.transports.Console()] })

// takes any valid ipv4 or iov6 address and converts it to an number (ipv4) or string (ipv6)
const numeric = (ip, requestId) => {
  if (!isIp(ip)) {
    logger.log({ requestId, level: 'error', src: 'utility/ip.numeric', message: 'invalid ip', ip })

    const error = new Error()
    error.message = `Invalid IP Address included in the request: ${ip}`
    error.code = http.BAD_REQUEST
    return error
  }

  if (isIp.v4(ip)) {
    return ipInt(ip).toInt()
  } else {
    // expand ipv6 address
    let fullAddress = ''
    let expandedAddress = ''
    const validGroupCount = 8
    const validGroupSize = 4
    const sides = ip.split('::')
    let groupsPresent = 0

    sides.forEach((side) => {
      groupsPresent += side.split(':').length
    })

    fullAddress += sides[0] + ':'
    for (let i = 0; i < validGroupCount - groupsPresent; i++) {
      fullAddress += '0000:'
    }
    fullAddress += sides[1]

    const groups = fullAddress.split(':')
    for (let i = 0; i < validGroupCount; i++) {
      while (groups[i].length < validGroupSize) {
        groups[i] = '0' + groups[i]
      }
      expandedAddress += (i !== validGroupCount - 1) ? groups[i] + ':' : groups[i]
    }

    const parts = []
    expandedAddress.split(':').forEach((it) => {
      let bin = parseInt(it, 16).toString(2)
      while (bin.length < 16) {
        bin = '0' + bin
      }
      parts.push(bin)
    })
    const bin = parts.join('')

    return bigInt(bin, 2).toString() // TODO: javascript cant repesent a number this big, so we return string - THIS WILL NOT WORK WITH REDIS ZRANGEBYSCORE
  }
}

module.exports = { numeric }
