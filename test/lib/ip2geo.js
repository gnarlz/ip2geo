'use strict'

const expect  = require("chai").expect;
const ip2geo = require('../../lib/ip2geo');

describe('ip2geo.lookup test',() => {

    it('null ip should return error', (done) => {
        ip2geo.lookup(null, function (err, data) {
            expect(data).to.be.an.instanceOf(Error).with.property('message', "ip2geo.lookup - no geo data for ip = null");
            expect(data).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });

    it('empty ip should return error', (done) => {
        ip2geo.lookup("", function (err, data) {
            expect(data).to.be.an.instanceOf(Error).with.property('message', "ip2geo.lookup - no geo data for ip = ");
            expect(data).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });

    it('invalid ipv4 ip should return error', (done) => {
        ip2geo.lookup("100.200.300.400", function (err, data) {
            expect(data).to.be.an.instanceOf(Error).with.property('message', "ip2geo.lookup - no geo data for ip = 100.200.300.400");
            expect(data).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });

    it('invalid ipv4 ip should return error', (done) => {
        ip2geo.lookup("2001:200:1c0:2000:0:0:0:X", function (err, data) {
            //console.log("data: " + JSON.stringify(data));
            expect(data).to.be.an.instanceOf(Error).with.property('message', "ip2geo.lookup - no geo data for ip = 2001:200:1c0:2000:0:0:0:X");
            expect(data).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });


    it('valid ipv4 invocation', (done) => {
        ip2geo.lookup(process.env.IPV4_IP, function (err, data) {
            expect(err).to.equal(null);
            expect(data.ip).to.equal(process.env.IPV4_IP);
            expect(data.latitude).to.equal(43.0334);
            expect(data.longitude).to.equal(-89.4512);
            expect(data.city_name).to.equal('Madison');
            expect(data.subdivision_1_name).to.equal('Wisconsin');
            expect(data.subdivision_1_iso_code).to.equal('WI');
            expect(data.postal_code).to.equal('53711');
            expect(data.country_name).to.equal('United States');
            expect(data.country_iso_code).to.equal('US');
            expect(data.continent_name).to.equal('North America');
            expect(data.continent_code).to.equal('NA');
            expect(data.time_zone).to.equal('America/Chicago');
            expect(data.time_zone_abbr).to.equal('CDT');
            expect(data.time_zone_offset).to.equal(-21600);
            expect(data.time_zone_is_dst).to.equal(false);
            expect(data.is_anonymous_proxy).to.equal(false);
            expect(data.is_satellite_provider).to.equal(false);
            done();
        });
    });

    //TODO: revisit - redis-mock is not working correctly for zrangebyscore for BIG INTs
    /*
    it('valid ipv6 invocation', (done) => {
        ip2geo.lookup(process.env.IPV6_IP, function (err, data) {
            expect(err).to.equal(null);
            expect(data.ip).to.equal(process.env.IPV6_IP);
            expect(data.latitude).to.equal(43.0334);
            expect(data.longitude).to.equal(-89.4512);
            expect(data.city_name).to.equal('Madison');
            expect(data.subdivision_1_name).to.equal('Wisconsin');
            expect(data.subdivision_1_iso_code).to.equal('WI');
            expect(data.postal_code).to.equal('53711');
            expect(data.country_name).to.equal('United States');
            expect(data.country_iso_code).to.equal('US');
            expect(data.continent_name).to.equal('North America');
            expect(data.continent_code).to.equal('NA');
            expect(data.time_zone).to.equal('America/Chicago');
            expect(data.time_zone_abbr).to.equal('CDT');
            expect(data.time_zone_offset).to.equal(-21600);
            expect(data.time_zone_is_dst).to.equal(false);
            expect(data.is_anonymous_proxy).to.equal(false);
            expect(data.is_satellite_provider).to.equal(false);
            done();
        });
     });
     */



});


