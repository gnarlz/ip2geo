'use strict'

/* eslint-env mocha */
const expect = require('chai').expect
const Promise = require('bluebird')
const redisMock = require('../redis-mock')
Promise.promisifyAll(redisMock.RedisMock.prototype)

describe('redis mock', () => {
  it('should test redis mock', async () => {
    const redis = new redisMock.RedisMock()
    await redis.hmsetAsync('id', 'foo', 'bar', 'bingo', 'bango')
    const result = await redis.hgetallAsync('id')
    expect(result).to.deep.equal({ foo: 'bar', bingo: 'bango' })
  })

  it('should expire correctly', async () => {
    const redis = new redisMock.RedisMock(50)
    const expireKey = 'expire'
    const nonExpireKey = 'no-expire'
    const expireMuchLaterKey = 'expire-later'

    await redis.hmsetAsync(expireKey, 'foo', 'bar')
    await redis.hmsetAsync(nonExpireKey, 'bingo', 'bango')
    await redis.hmsetAsync(expireMuchLaterKey, 'always', 'be closing')
    await redis.expireatAsync(expireKey, new Date().getTime())
    await redis.expireatAsync(expireMuchLaterKey, new Date().getTime() + 1000)
    expect(await redis.existsAsync(expireKey)).to.equal(1)
    expect(await redis.existsAsync(nonExpireKey)).to.equal(1)
    expect(await redis.existsAsync(expireMuchLaterKey)).to.equal(1)
    expect(await redis.hgetallAsync(expireKey)).to.deep.equal({ foo: 'bar' })
    expect(await redis.hgetallAsync(nonExpireKey)).to.deep.equal({ bingo: 'bango' })
    expect(await redis.hgetallAsync(expireMuchLaterKey)).to.deep.equal({ always: 'be closing' })
  })
})
