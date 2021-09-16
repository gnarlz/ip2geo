'use strict'

/* eslint-env mocha */
const expect = require('chai').expect
const proxyquire = require('proxyquire')

const http = require('http-codes')

const unit = (fns) => {
  return proxyquire('../../../lib/ip2geo', {
    '../redis/redis-client': {
      send_command: fns.send_command || (it => it)
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

const validIP = '130.140.150.160'

describe('lib/ip2geo test', () => {
  it('should return successful response when zrangebyscore returns data for ip in redis', () => {
    const geoResponse = {
      latitude: '70.123',
      longitude: '120.567',
      city_name: 'Madison',
      subdivision_1_name: 'Wisconsin',
      subdivision_1_iso_code: 'WI',
      postal_code: '53711',
      country_name: 'America',
      country_iso_code: 'US',
      continent_name: 'North America',
      continent_code: 'NA',
      time_zone: 'America/Chicago',
      time_zone_abbr: 'CDT',
      time_zone_offset: -21600,
      time_zone_is_dst: 1,
      time_zone_current_time: '2021-09-12T16:46:09-06:00',
      is_anonymous_proxy: 't',
      is_satellite_provider: 't'
    }
    const ip2geoProxy = unit({ bind: async () => { return [JSON.stringify(geoResponse)] } })
    return ip2geoProxy.lookup(validIP, 'requestId-12345')
      .then((response) => {
        expect(response).to.be.an('object')
        expect(response.latitude).to.equal(70.123)
        expect(response.longitude).to.equal(120.567)
        expect(response.city_name).to.equal('Madison')
        expect(response.subdivision_1_name).to.equal('Wisconsin')
        expect(response.postal_code).to.equal('53711')
        expect(response.country_name).to.equal('America')
        expect(response.country_iso_code).to.equal('US')
        expect(response.continent_name).to.equal('North America')
        expect(response.continent_code).to.equal('NA')
        expect(response.time_zone).to.equal('America/Chicago')
        expect(response.time_zone_abbr).to.equal('CDT')
        expect(response.time_zone_offset).to.equal(-21600)
        expect(response.time_zone_is_dst).to.equal(true)
        expect(response.time_zone_current_time).to.be.a('string')
        expect(response.is_anonymous_proxy).to.equal(true)
        expect(response.is_satellite_provider).to.equal(true)
      })
  })
  it('should return successful response when zrangebyscore returns data for ip in redis (no lat/lon returned)', () => {
    const geoResponse = {
      // latitude: "70.123",
      // longitude: "120.567",
      city_name: 'Madison',
      subdivision_1_name: 'Wisconsin',
      subdivision_1_iso_code: 'WI',
      postal_code: '53711',
      country_name: 'America',
      country_iso_code: 'US',
      continent_name: 'North America',
      continent_code: 'NA',
      time_zone: 'America/Chicago',

      time_zone_abbr: 'CDT',
      time_zone_offset: -21600,
      time_zone_is_dst: 0,
      time_zone_current_time: '2021-09-12T16:46:09-06:00',
      is_anonymous_proxy: false,
      is_satellite_provider: false
    }
    const ip2geoProxy = unit({ bind: async () => { return [JSON.stringify(geoResponse)] } })
    return ip2geoProxy.lookup(validIP, 'requestId-12345')
      .then((response) => {
        expect(response).to.be.an('object')
        expect(response.latitude).to.equal(0)
        expect(response.longitude).to.equal(0)
        expect(response.city_name).to.equal('Madison')
        expect(response.subdivision_1_name).to.equal('Wisconsin')
        expect(response.postal_code).to.equal('53711')
        expect(response.country_name).to.equal('America')
        expect(response.country_iso_code).to.equal('US')
        expect(response.continent_name).to.equal('North America')
        expect(response.continent_code).to.equal('NA')
        expect(response.time_zone).to.equal('America/Chicago')
        expect(response.time_zone_abbr).to.equal('CDT')
        expect(response.time_zone_offset).to.equal(-21600)
        expect(response.time_zone_is_dst).to.equal(false)
        expect(response.time_zone_current_time).to.be.a('string')
        expect(response.is_anonymous_proxy).to.equal(false)
        expect(response.is_satellite_provider).to.equal(false)
      })
  })
  it('should return successful response when zrangebyscore returns data for ip in redis (no time_zone, time_zone_offset or time_zone_is_dst returned)', () => {
    const geoResponse = {
      latitude: '70.123',
      longitude: '120.567',
      city_name: 'Madison',
      subdivision_1_name: 'Wisconsin',
      subdivision_1_iso_code: 'WI',
      postal_code: '53711',
      country_name: 'America',
      country_iso_code: 'US',
      continent_name: 'North America',
      continent_code: 'NA',
      // time_zone: "America/Chicago",
      time_zone_abbr: 'CDT',
      // time_zone_offset: -21600,
      // time_zone_is_dst: 0,
      // time_zone_current_time: "2021-09-12T16:46:09-06:00",
      is_anonymous_proxy: false,
      is_satellite_provider: false
    }
    const ip2geoProxy = unit({ bind: async () => { return [JSON.stringify(geoResponse)] } })
    return ip2geoProxy.lookup(validIP, 'requestId-12345')
      .then((response) => {
        expect(response).to.be.an('object')
        expect(response.latitude).to.equal(70.123)
        expect(response.longitude).to.equal(120.567)
        expect(response.city_name).to.equal('Madison')
        expect(response.subdivision_1_name).to.equal('Wisconsin')
        expect(response.postal_code).to.equal('53711')
        expect(response.country_name).to.equal('America')
        expect(response.country_iso_code).to.equal('US')
        expect(response.continent_name).to.equal('North America')
        expect(response.continent_code).to.equal('NA')
        // expect(response.time_zone).to.equal('America/Chicago')
        expect(response.time_zone_abbr).to.equal('CDT')
        expect(response.time_zone_offset).to.equal(0)
        expect(response.time_zone_is_dst).to.equal(false)
        // expect(response.time_zone_current_time).to.be.ok
        expect(response.is_anonymous_proxy).to.equal(false)
        expect(response.is_satellite_provider).to.equal(false)
      })
  })
  it('should return successful response when zrangebyscore returns data for ip in redis (no is_anonymous_proxy or is_satellite_provider returned)', () => {
    const geoResponse = {
      // latitude: "70.123",
      // longitude: "120.567",
      city_name: 'Madison',
      subdivision_1_name: 'Wisconsin',
      subdivision_1_iso_code: 'WI',
      postal_code: '53711',
      country_name: 'America',
      country_iso_code: 'US',
      continent_name: 'North America',
      continent_code: 'NA',
      time_zone: 'America/Chicago',

      time_zone_abbr: 'CDT',
      time_zone_offset: -21600,
      time_zone_is_dst: 0,
      time_zone_current_time: '2021-09-12T16:46:09-06:00'
      // is_anonymous_proxy: false,
      // is_satellite_provider: false
    }
    const ip2geoProxy = unit({ bind: async () => { return [JSON.stringify(geoResponse)] } })
    return ip2geoProxy.lookup(validIP, 'requestId-12345')
      .then((response) => {
        expect(response).to.be.an('object')
        expect(response.latitude).to.equal(0)
        expect(response.longitude).to.equal(0)
        expect(response.city_name).to.equal('Madison')
        expect(response.subdivision_1_name).to.equal('Wisconsin')
        expect(response.postal_code).to.equal('53711')
        expect(response.country_name).to.equal('America')
        expect(response.country_iso_code).to.equal('US')
        expect(response.continent_name).to.equal('North America')
        expect(response.continent_code).to.equal('NA')
        expect(response.time_zone).to.equal('America/Chicago')
        expect(response.time_zone_abbr).to.equal('CDT')
        expect(response.time_zone_offset).to.equal(-21600)
        expect(response.time_zone_is_dst).to.equal(false)
        expect(response.time_zone_current_time).to.be.a('string')
        expect(response.is_anonymous_proxy).to.equal(false)
        expect(response.is_satellite_provider).to.equal(false)
      })
  })
  it('should throw when zrangebyscore returns no data for ip in redis', () => {
    const ip2geoProxy = unit({ bind: async () => { return [] } })
    return ip2geoProxy.lookup(validIP, 'requestId-12345')
      .then((response) => { throw new Error('should have thrown error, test failed') })
      .catch((error) => {
        expect(error.message).to.be.contain('no geo data for ip')
        expect(error.code).to.be.equal(http.BAD_REQUEST)
      })
  })
  it('should throw when zrangebyscore is not successful in redis', () => {
    const ip2geoProxy = unit({ bind: async () => { throw new Error() } })
    return ip2geoProxy.lookup(validIP, 'requestId-12345')
      .then((response) => { throw new Error('should have thrown error, test failed') })
      .catch((error) => {
        expect(error.message).to.be.contain('internal server error')
        expect(error.code).to.be.equal(http.INTERNAL_SERVER_ERROR)
      })
  })
})
