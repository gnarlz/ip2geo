'use strict'

const expect  = require("chai").expect
const http = require('http-codes')
const ip = require('../../../lib/ip')


describe('lib/ip test',() => {
    it('ip.numeric() should throw for an invalid ipv4 and ipv6 addresses', () => {
        const invalidIPs = ['3456', 'foo', '100.200.300.400', '2001:db8:3333:4444:5555:6666:7777:888x']
        invalidIPs.map( (ipAddress) => {
            const result = ip.numeric(ipAddress)
            expect(result).to.be.an('error')
            expect(result.message).to.contain('Invalid IP Address included in the request')
            expect(result.code).to.equal(http.BAD_REQUEST)
        })
    })
    it('ip.numeric() should return numeric value for a valid ipv4 address', () => {
        expect(ip.numeric('137.62.55.219')).to.be.an('number')
    })
    it('ip.numeric() should return numeric value for a valid ipv6 address', () => {
        expect(ip.numeric('2001:db8:3333:4444:5555:6666:7777:8888')).to.be.an('string')
    })
    it('ip.numeric() should return numeric value for a valid ipv6 address (address needs expansion)', () => {
        expect(ip.numeric('2001:0000:3238:DFE1:63::FEFB')).to.be.an('string')
    })
   
})