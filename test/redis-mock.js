'use strict'

const _ = {
  cloneDeep: require('lodash.clonedeep')
}

class RedisMock {
  constructor (expirationMonitorIntervalMillis = 500) {
    this.cache = {}
    this.expirations = {}
    this._monitorExpirations(expirationMonitorIntervalMillis)
  }

  _monitorExpirations (intervalMillis) {
    setInterval(() => { this._evictAll() }, intervalMillis)
  }

  _evictAll () {
    const now = new Date().getTime()
    Object
      .keys(this.expirations)
      .filter(key => now > this.expirations[key])
      .forEach(key => {
        delete this.expirations[key]
        delete this.cache[key]
      })
  }

  del (key, done) {
    delete this.cache[key]
    done(null, false)
  }

  hmset (key, ...args) {
    const cb = args[args.length - 1]
    const obj = this.cache[key] || {}
    for (let i = 0; i < args.length - 2;) {
      obj[args[i++]] = args[i++]
    }
    this.cache[key] = _.cloneDeep(obj)
    cb(null, 'OK')
  }

  expireat (key, unixTimeInSeconds, done) {
    this._expireatmillis(key, unixTimeInSeconds * 1000, done)
  }

  _expireatmillis (key, timeInMillis, done) {
    this.expirations[key] = timeInMillis
    done(null, 0)
  }

  hgetall (key, done) {
    done(null, _.cloneDeep(this.cache[key]))
  }

  hmget (key, field, done) {
    done(null, _.cloneDeep([this.cache[key] && this.cache[key][field]]))
  }

  exists (key, done) {
    done(null, this.cache[key] ? 1 : 0)
  }

  ttl (key, done) {
    done(null, this.expirations[key])
  }

  keys () {
    return []
  }
}

module.exports = {
  createClient: () => new RedisMock(),
  RedisMock: RedisMock
}
