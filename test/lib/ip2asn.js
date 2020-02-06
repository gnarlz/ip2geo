'use strict'

const config = require('../config');
const expect  = require("chai").expect;
const ip2asn = require('../../lib/ip2asn');


describe('ip2asn.lookup test',() => {

    it('null ip should return error', (done) => {
        ip2asn.lookup(null, function (err, data) {
            expect(data).to.be.an.instanceOf(Error).with.property('message', "ip2asn.lookup - no asn data for ip = null");
            expect(data).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });

    it('empty ip should return error', (done) => {
        ip2asn.lookup("", function (err, data) {
            expect(data).to.be.an.instanceOf(Error).with.property('message', "ip2asn.lookup - no asn data for ip = ");
            expect(data).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });

    it('invalid ipv4 ip should return error', (done) => {
        ip2asn.lookup("100.200.300.400", function (err, data) {
            expect(data).to.be.an.instanceOf(Error).with.property('message', "ip2asn.lookup - no asn data for ip = 100.200.300.400");
            expect(data).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });

    it('invalid ipv4 ip should return error', (done) => {
        ip2asn.lookup("2001:200:1c0:2000:0:0:0:X", function (err, data) {
            //console.log("data: " + JSON.stringify(data));
            expect(data).to.be.an.instanceOf(Error).with.property('message', "ip2asn.lookup - no asn data for ip = 2001:200:1c0:2000:0:0:0:X");
            expect(data).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });


    it('valid ipv4 invocation', (done) => {
        ip2asn.lookup(process.env.IPV4_IP, function (err, data) {
            // {"asn":"20115","organization":"CHARTER-NET-HKY-NC - Charter Communications"}
            expect(err).to.equal(null);
            console.log("JSON.stringify(data): " + JSON.stringify(data));
            expect(data.asn).to.equal('20115');
            expect(data.organization).to.equal('CHARTER-NET-HKY-NC - Charter Communications');
            done();
        });
    });

    //TODO: revisit - redis-mock is not working correctly for zrangebyscore for BIG INTs
    /*
    it('valid ipv6 invocation', (done) => {
        ip2asn.lookup(process.env.IPV6_IP, function (err, data) {
            expect(err).to.equal(null);
            expect(data.asn).to.equal('20115');
            expect(data.organization).to.equal('CHARTER-NET-HKY-NC - Charter Communications');
            done();
        });
     });
     */



});


