'use strict'

const config = require('../config');
const expect  = require("chai").expect;
const ip2asn = require('../../lib/ip2asn');


describe('ip2asn.lookup test',() => {

    it('null ip should return error', () => {
        return  ip2asn.lookup(null)
            .catch((error) => {
                expect(error).to.be.an.instanceOf(Error).with.property('message', 'ip2asn.lookup - no asn data for ip = null');
                expect(error).to.be.an.instanceOf(Error).with.property('code', 400);
            })
    });
    it('empty ip should return error', () => {
        return  ip2asn.lookup("")
            .catch((error) => {
                expect(error).to.be.an.instanceOf(Error).with.property('message', 'ip2asn.lookup - no asn data for ip = ');
                expect(error).to.be.an.instanceOf(Error).with.property('code', 400);
            })
    });
    it('invalid ipv4 should return error', () => {
        return  ip2asn.lookup("100.200.300.400")
            .catch((error) => {
                expect(error).to.be.an.instanceOf(Error).with.property('message', 'ip2asn.lookup - no asn data for ip = 100.200.300.400');
                expect(error).to.be.an.instanceOf(Error).with.property('code', 400);
            })
    });
    it('invalid ipv6 should return error', () => {
        return  ip2asn.lookup("2001:200:1c0:2000:0:0:0:X")
            .catch((error) => {
                expect(error).to.be.an.instanceOf(Error).with.property('message', 'ip2asn.lookup - no asn data for ip = 2001:200:1c0:2000:0:0:0:X');
                expect(error).to.be.an.instanceOf(Error).with.property('code', 400);
            })
    });

    it('valid ipv4 invocation', () => {
        return  ip2asn.lookup(process.env.IPV4_IP)
            .then((data) => {
                //console.log("valid ipv4: " + JSON.stringify(data));
                // valid ipv4: {"asn":"20115","organization":"CHARTER-NET-HKY-NC - Charter Communications"}
                expect(data).to.be.not.null;
                expect(data.asn).to.equal("20115");
                expect(data.organization).to.equal("CHARTER-NET-HKY-NC - Charter Communications");
            })
    });
    it('valid ipv6 invocation', () => {
        return  ip2asn.lookup(process.env.IPV6_IP)
            .then((data) => {
                //console.log("valid ipv6: " + JSON.stringify(data));
                // valid ipv6: {"asn":"2500","organization":"WIDE-BB WIDE Project"}
                expect(data).to.be.not.null;
                expect(data.asn).to.equal("2500");
                expect(data.organization).to.equal("WIDE-BB WIDE Project");
            })
    });

});


