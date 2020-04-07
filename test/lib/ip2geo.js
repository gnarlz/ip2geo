'use strict'

const config = require('../config');
const expect  = require("chai").expect;
const ip2geo = require('../../lib/ip2geo');


describe('ip2geo.lookup test',() => {

    it('null ip should return error', () => {
        return  ip2geo.lookup(null)
            .catch((error) => {
                expect(error).to.be.an.instanceOf(Error).with.property('message', 'ip2geo.lookup - no geo data for ip = null');
                expect(error).to.be.an.instanceOf(Error).with.property('code', 400);
            })
    });
    it('empty ip should return error', () => {
        return  ip2geo.lookup("")
            .catch((error) => {
                expect(error).to.be.an.instanceOf(Error).with.property('message', 'ip2geo.lookup - no geo data for ip = ');
                expect(error).to.be.an.instanceOf(Error).with.property('code', 400);
            })
    });
    it('invalid ipv4 should return error', () => {
        return  ip2geo.lookup("100.200.300.400")
            .catch((error) => {
                expect(error).to.be.an.instanceOf(Error).with.property('message', 'ip2geo.lookup - no geo data for ip = 100.200.300.400');
                expect(error).to.be.an.instanceOf(Error).with.property('code', 400);
            })
    });
    it('invalid ipv6 should return error', () => {
        return  ip2geo.lookup("2001:200:1c0:2000:0:0:0:X")
            .catch((error) => {
                expect(error).to.be.an.instanceOf(Error).with.property('message', 'ip2geo.lookup - no geo data for ip = 2001:200:1c0:2000:0:0:0:X');
                expect(error).to.be.an.instanceOf(Error).with.property('code', 400);
            })
    });


    it('valid ipv4 invocation', () => {
        return  ip2geo.lookup(process.env.IPV4_IP)
            .then((data) => {
                console.log("valid ipv4: " + JSON.stringify(data));
                expect(data).to.be.not.null;
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

            })
    });


    it('valid ipv6 invocation', () => {
        return  ip2geo.lookup(process.env.IPV6_IP)
            .then((data) => {
                console.log("valid ipv6: " + JSON.stringify(data));
                expect(data).to.be.not.null;
                expect(data.ip).to.equal(process.env.IPV6_IP);
                expect(data.latitude).to.equal(35.5569);
                expect(data.longitude).to.equal(139.6444);
                expect(data.city_name).to.equal('Yokohama');
                expect(data.subdivision_1_name).to.equal('Kanagawa');
                expect(data.subdivision_1_iso_code).to.equal('14');
                expect(data.postal_code).to.equal('223-0061');
                expect(data.country_name).to.equal('Japan');
                expect(data.country_iso_code).to.equal('JP');
                expect(data.continent_name).to.equal('Asia');
                expect(data.continent_code).to.equal('AS');
                expect(data.time_zone).to.equal('Asia/Tokyo');
                expect(data.time_zone_abbr).to.equal('JST');
                expect(data.time_zone_offset).to.equal(32400);
                expect(data.time_zone_is_dst).to.equal(false);
                expect(data.is_anonymous_proxy).to.equal(false);
                expect(data.is_satellite_provider).to.equal(false);
            })
    });

});


