'use strict'

/* eslint-env mocha */
const expect = require('chai').expect
const proxyquire = require('proxyquire')

const unit = (fns) => {
  return proxyquire('../../../scheduled/authorization', {
    '../redis/redis-client': {
      send_command: fns.send_command || (it => it)
    },
    '../postgres/postgres-client': {
      query: fns.query || (it => it)
    },
    util: {
      promisify (opts) {
        return {
          bind: () => {
            return fns.bind || (it => it)
          }
        }
      }
    }
  })
}

describe('scheduled/authorization test', () => {
  it('should return null when query() is successful in insertPostgresAuthorization() (ratelimit_max and ratelimit_duration)', () => {
    const row = { key: 'key123', ratelimit_max: 100, ratelimit_duration: 60 }
    const authorizationProxy = unit({ query: async (sql) => { return null } })
    return authorizationProxy.insertPostgresAuthorization(row, 'requestId-12345')
      .then((response) => { expect(response).to.be.a('null') })
  })
  it('should return null when query() is successful in insertPostgresAuthorization() (no ratelimit_max)', () => {
    const row = { key: 'key123', ratelimit_duration: 60 }
    const authorizationProxy = unit({ query: async (sql) => { return null } })
    return authorizationProxy.insertPostgresAuthorization(row, 'requestId-12345')
      .then((response) => { expect(response).to.be.a('null') })
  })
  it('should return null when query() is successful in insertPostgresAuthorization() (no ratelimit_duration)', () => {
    const row = { key: 'key123', ratelimit_max: 100 }
    const authorizationProxy = unit({ query: async (sql) => { return null } })
    return authorizationProxy.insertPostgresAuthorization(row, 'requestId-12345')
      .then((response) => { expect(response).to.be.a('null') })
  })
  it('should return null when query() is successful in insertPostgresAuthorization() (no ratelimit_max and no ratelimit_duration)', () => {
    const row = { key: 'key123' }
    const authorizationProxy = unit({ query: async (sql) => { return null } })
    return authorizationProxy.insertPostgresAuthorization(row, 'requestId-12345')
      .then((response) => { expect(response).to.be.a('null') })
  })
  it('should throw when error is thrown by query() in insertPostgresAuthorization()', () => {
    const row = { key: 'key123', ratelimit_max: 100, ratelimit_duration: 60 }
    const authorizationProxy = unit({ query: async (sql) => { throw new Error('insertPostgresAuthorization query error') } })
    return authorizationProxy.insertPostgresAuthorization(row, 'requestId-12345')
      .then((response) => { throw new Error('should have thrown error, test failed') })
      .catch((error) => { expect(error.message).to.contain('insertPostgresAuthorization query error') })
  })

  it('should return null when insert is successful in setRedisAuthorization() (ratelimit_max and ratelimit_duration)', () => {
    const row = { key: 'abc123', request_total: 1001, limit_: 1000, ratelimit_max: 5, ratelimit_duration: 60 }
    const authorizationProxy = unit({ bind: async () => { return null } })
    return authorizationProxy.setRedisAuthorization(row, 'requestId-12345')
      .then((response) => { expect(response).to.be.a('null') })
  })
  it('should return null when insert is successful in setRedisAuthorization() (no ratelimit_max)', () => {
    const row = { key: 'abc123', request_total: 1001, limit_: 1000, ratelimit_duration: 60 }
    const authorizationProxy = unit({ bind: async () => { return null } })
    return authorizationProxy.setRedisAuthorization(row, 'requestId-12345')
      .then((response) => { expect(response).to.be.a('null') })
  })
  it('should return null when insert is successful in setRedisAuthorization() (no ratelimit_duration)', () => {
    const row = { key: 'abc123', request_total: 1001, limit_: 1000, ratelimit_max: 5 }
    const authorizationProxy = unit({ bind: async () => { return null } })
    return authorizationProxy.setRedisAuthorization(row, 'requestId-12345')
      .then((response) => { expect(response).to.be.a('null') })
  })
  it('should return null when insert is successful in setRedisAuthorization() (no ratelimit_max and no ratelimit_duration)', () => {
    const row = { key: 'abc123', request_total: 1001, limit_: 1000 }
    const authorizationProxy = unit({ bind: async () => { return null } })
    return authorizationProxy.setRedisAuthorization(row, 'requestId-12345')
      .then((response) => { expect(response).to.be.a('null') })
  })
  it('should throw when insert is not successful in redis', () => {
    const row = { key: 'abc123', request_total: 1001, limit_: 1000, ratelimit_max: 5, ratelimit_duration: 60 }
    const authorizationProxy = unit({ bind: async () => { throw new Error('redisClientSendCommand error') } })
    return authorizationProxy.setRedisAuthorization(row, 'requestId-12345')
      .then((response) => { throw new Error('should have thrown error, test failed') })
      .catch((error) => { expect(error.message).to.be.contain('redisClientSendCommand error') })
  })

  it('should return null when run() is successful (keys to expire)', () => {
    const rows = [
      { key: 'abc123', request_total: 1001, limit_: 1000, ratelimit_max: 5, ratelimit_duration: 60 },
      { key: 'def456', request_total: 1002, limit_: 1001, ratelimit_max: 6, ratelimit_duration: 61 },
      { key: 'ghi789', request_total: 1003, limit_: 1002, ratelimit_max: 7, ratelimit_duration: 62 }
    ]
    const authorizationProxy = unit({
      bind: async () => { return null },
      query: async (sql) => {
        if (sql.includes('SELECT')) {
          return { rows }
        } else {
          return null
        }
      }
    })
    return authorizationProxy.run({})
      .then((response) => { expect(response).to.be.a('null') })
  })
  it('should return null when run() is successful (no keys to expire)', () => {
    const rows = []
    const authorizationProxy = unit({
      bind: async () => { return null },
      query: async (sql) => {
        if (sql.includes('SELECT')) {
          return { rows }
        } else {
          return null
        }
      }
    })
    return authorizationProxy.run({})
      .then((response) => { expect(response).to.be.a('null') })
  })

  it('should throw when run() is not successful (postgres SELECT query throws)', () => {
    const authorizationProxy = unit({
      bind: async () => { return null },
      query: async (sql) => {
        if (sql.includes('SELECT')) {
          throw new Error('select error')
        } else {
          return null
        }
      }
    })
    return authorizationProxy.run({})
      .then((response) => { throw new Error('should have thrown error, test failed') })
      .catch((error) => { expect(error.message).to.be.contain('select error') })
  })
  it('should throw when run() is not successful (postgres INSERT query throws)', () => {
    const rows = [
      { key: 'abc123', request_total: 1001, limit_: 1000, ratelimit_max: 5, ratelimit_duration: 60 },
      { key: 'def456', request_total: 1002, limit_: 1001, ratelimit_max: 6, ratelimit_duration: 61 },
      { key: 'ghi789', request_total: 1003, limit_: 1002, ratelimit_max: 7, ratelimit_duration: 62 }
    ]
    const authorizationProxy = unit({
      bind: async () => { return null },
      query: async (sql) => {
        if (sql.includes('SELECT')) {
          return { rows }
        } else {
          throw new Error('insert error')
        }
      }
    })
    return authorizationProxy.run({})
      .then((response) => { throw new Error('should have thrown error, test failed') })
      .catch((error) => { expect(error.message).to.be.contain('insert error') })
  })
  it('should throw when run() is not successful (redis SET throws)', () => {
    const rows = [
      { key: 'abc123', request_total: 1001, limit_: 1000, ratelimit_max: 5, ratelimit_duration: 60 },
      { key: 'def456', request_total: 1002, limit_: 1001, ratelimit_max: 6, ratelimit_duration: 61 },
      { key: 'ghi789', request_total: 1003, limit_: 1002, ratelimit_max: 7, ratelimit_duration: 62 }
    ]
    const authorizationProxy = unit({
      bind: async () => { throw new Error('set error') },
      query: async (sql) => {
        if (sql.includes('SELECT')) {
          return { rows }
        } else {
          return null
        }
      }
    })
    return authorizationProxy.run({})
      .then((response) => { throw new Error('should have thrown error, test failed') })
      .catch((error) => { expect(error.message).to.be.contain('set error') })
  })
})
