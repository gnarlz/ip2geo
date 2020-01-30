'use strict'

const expect  = require("chai").expect;
const handler = require('../handler');
const test_setup = require('./lib/setup');
const uuidv4 = require('uuid/v4');
const config = require('./config.json');

describe('handler.lookup',() => {

    /*
    ==========================================================================================
    =========================================  TESTS =========================================
    ==========================================================================================

    no key parameter in query string
    empty key parameter in query string
    invalid key parameter in query string (key not uuid)
    invalid key parameter in query string (key uuid not in redis)
    unauthorized key parameter in query string (key in redis with authorized == false)

    no ip parameter in query string
    empty ip parameter in query string
    invalid ip parameter (i.e. foo) in query string
    invalid ip parameter (i.e. 333.333.333.333) in query string

    valid ipv4 ip parameter in query string
    //TODO: revisit - redis-mock is not working correctly for zrangebyscore for BIG INTs
    X valid ipv6 ip parameter in query string

    */

    const valid_key = uuidv4();
    const suspended_key = uuidv4();
    process.env.VALID_KEY = valid_key;
    process.env.SUSPENDED_KEY = suspended_key;
    console.log("valid testing API key for this test: " + valid_key);
    console.log("suspended testing API key for this test: " + suspended_key + "\n\n");

    process.env.MODE = config.MODE;
    process.env.IP2GEO_KEYSPACE = config.IP2GEO_KEYSPACE;
    process.env.IP2ASN_KEYSPACE = config.IP2ASN_KEYSPACE;
    process.env.SOURCE_IP = config.SOURCE_IP;
    process.env.IPV4_IP = config.IPV4_IP;
    process.env.IPV6_IP = config.IPV6_IP;
    process.env.SENDGRID_API_KEY = config.SENDGRID_API_KEY;
    process.env.NEW_ACCOUNT_EMAIL_CC = config.NEW_ACCOUNT_EMAIL_CC;
    process.env.NEW_ACCOUNT_EMAIL_BCC = config.NEW_ACCOUNT_EMAIL_BCC;
    process.env.NEW_ACCOUNT_EMAIL_FROM = config.NEW_ACCOUNT_EMAIL_FROM;
    process.env.NEW_ACCOUNT_EMAIL_REPLYTO = config.NEW_ACCOUNT_EMAIL_REPLYTO;
    process.env.NEW_ACCOUNT_EMAIL_TEMPLATE_ID = config.NEW_ACCOUNT_EMAIL_TEMPLATE_ID;
    process.env.STRIPE_PRIVATE_KEY = config.STRIPE_PRIVATE_KEY;



    it('setup', (done) => {
        test_setup.run( function (err) {
            expect(err).to.be.null;
            done();
        });
    });


    it('no key parameter in query string should return valid response with statusCode 400 and error.message value', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        handler.lookup(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(400);

            const body = JSON.parse(data.body);
            //console.log("body.status_code: " + body.status_code);
            expect(body.status_code).to.equal(400);
            //console.log("body.error.message: " + body.error.message);
            expect(body.error.message).to.equal("No API Key included in the request");
            done();
        });
    });
    it('empty key parameter in query string should return valid response with statusCode 400 and error.message value', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": ""
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        handler.lookup(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(400);
            const body = JSON.parse(data.body);
            expect(body.status_code).to.equal(400);
            expect(body.error.message).to.equal("No API Key included in the request");
            done();
        });
    });
    it('invalid key parameter (not a uuid) in query string should return valid response with statusCode 400 and error.message value', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": "foo"
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        handler.lookup(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(400);
            const body = JSON.parse(data.body);
            expect(body.status_code).to.equal(400);
            expect(body.error.message).to.equal("Invalid API Key included in the request: foo");
            done();
        });
    });
    it('invalid key parameter (uuid but not a valid key) in query string should return valid response with statusCode 400 and error.message value', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const invalid_key = uuidv4();
        const event = {
            queryStringParameters:{
                "key": invalid_key
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        handler.lookup(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(401);
            const body = JSON.parse(data.body);
            expect(body.status_code).to.equal(401);
            expect(body.error.message).to.equal("API Key is unrecognized: " + invalid_key);
            done();
        });
    });
    it('suspended key parameter in query string should return valid response with statusCode 403 and error.message value', (done) => {

        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": suspended_key
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        handler.lookup(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(403);
            const body = JSON.parse(data.body);
            expect(body.status_code).to.equal(403);
            expect(body.error.message).to.equal("Your API key has been suspended because you have exceeded your plans monthly request limit. Please contact support@ip2geo.co to resolve this issue." );
            done();
        });
    });




    it('no ip parameter in query string should return statusCode 200 and fully formed response', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": valid_key,
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        handler.lookup(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(200);
            const body = JSON.parse(data.body);
            expect(body.time_elapsed).to.be.a('number');
            expect(body.request.request_id).to.exist;
            expect(body.request.request_ts).to.exist;
            expect(body.request.source_ip).to.equal('8.8.8.8');
            expect(body.request.lookup_ip).to.equal('8.8.8.8');
            expect(body.request.is_desktop).to.be.a('boolean');
            expect(body.request.is_mobile).to.be.a('boolean');
            expect(body.request.is_smart_tv).to.be.a('boolean');
            expect(body.request.is_tablet).to.be.a('boolean');
            expect(body.status).to.equal("success");
            expect(body.status_code).to.equal(200);
            expect(body.location.ip).to.be.a('string');
            expect(body.location.latitude).to.be.a('number');
            expect(body.location.longitude).to.be.a('number');
            expect(body.location.city_name).to.exist;
            expect(body.location.region_name).to.exist;
            expect(body.location.region_iso_code).to.exist;
            expect(body.location.postal_code).to.exist;
            expect(body.location.country_name).to.equal('United States');
            expect(body.location.country_iso_code).to.equal('US');
            expect(body.location.continent_name).to.equal('North America');
            expect(body.location.continent_code).to.equal('NA');
            expect(body.timezone.time_zone).to.equal('America/Chicago');
            expect(body.timezone.time_zone_abbr).to.equal('CDT');
            expect(body.timezone.time_zone_offset).to.equal(-21600);
            expect(body.timezone.time_zone_is_dst).to.equal(false);
            expect(body.timezone.time_zone_current_time).to.be.a('string');
            expect(body.security.is_anonymous_proxy).to.equal(false);
            expect(body.security.is_satellite_provider).to.equal(false);
            expect(body.isp.asn).to.equal('15169');
            expect(body.isp.organization).to.equal('GOOGLE - Google LLC');
            done();
        });
    });


    it('empty ip parameter in query string should return statusCode 200 and fully formed response', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": valid_key,
                "ip": ""
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        handler.lookup(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(200);
            const body = JSON.parse(data.body);
            expect(body.time_elapsed).to.be.a('number');
            expect(body.request.request_id).to.exist;
            expect(body.request.request_ts).to.exist;
            expect(body.request.source_ip).to.equal('8.8.8.8');
            expect(body.request.lookup_ip).to.equal('8.8.8.8');
            expect(body.request.is_desktop).to.be.a('boolean');
            expect(body.request.is_mobile).to.be.a('boolean');
            expect(body.request.is_smart_tv).to.be.a('boolean');
            expect(body.request.is_tablet).to.be.a('boolean');
            expect(body.status).to.equal("success");
            expect(body.status_code).to.equal(200);
            expect(body.location.ip).to.be.a('string');
            expect(body.location.latitude).to.be.a('number');
            expect(body.location.longitude).to.be.a('number');
            expect(body.location.city_name).to.exist;
            expect(body.location.region_name).to.exist;
            expect(body.location.region_iso_code).to.exist;
            expect(body.location.postal_code).to.exist;
            expect(body.location.country_name).to.equal('United States');
            expect(body.location.country_iso_code).to.equal('US');
            expect(body.location.continent_name).to.equal('North America');
            expect(body.location.continent_code).to.equal('NA');
            expect(body.timezone.time_zone).to.equal('America/Chicago');
            expect(body.timezone.time_zone_abbr).to.equal('CDT');
            expect(body.timezone.time_zone_offset).to.equal(-21600);
            expect(body.timezone.time_zone_is_dst).to.equal(false);
            expect(body.timezone.time_zone_current_time).to.be.a('string');
            expect(body.security.is_anonymous_proxy).to.equal(false);
            expect(body.security.is_satellite_provider).to.equal(false);
            expect(body.isp.asn).to.equal('15169');
            expect(body.isp.organization).to.equal('GOOGLE - Google LLC');
            done();
        });
    });


    it('invalid ip parameter in query string (foo) should return valid response with statusCode 403 and error.message value', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": valid_key,
                "ip": "foo"
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        handler.lookup(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(400);
            const body = JSON.parse(data.body);
            expect(body.status_code).to.equal(400);
            expect(body.error.message).to.equal("Invalid IP Address included in the request: foo");
            done();
        });
    });
    it('invalid ip parameter in query string (333.333.333.333) should return valid response with statusCode 403 and error.message value', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": valid_key,
                "ip": "333.333.333.333"
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        handler.lookup(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(400);
            const body = JSON.parse(data.body);
            expect(body.status_code).to.equal(400);
            expect(body.error.message).to.equal("Invalid IP Address included in the request: 333.333.333.333");
            done();
        });
    });











    it('valid ipv4 ip parameter in query string should return statusCode 200 and fully formed response', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": valid_key,
                "ip": process.env.IPV4_IP
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        handler.lookup(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(200);
            const body = JSON.parse(data.body);
            expect(body.time_elapsed).to.be.a('number');
            expect(body.request.request_id).to.be.a('string');
            expect(body.request.request_ts).to.be.a('string');
            expect(body.request.source_ip).to.equal('8.8.8.8');
            expect(body.request.lookup_ip).to.equal('137.27.69.73');
            expect(body.request.is_desktop).to.equal(false);
            expect(body.request.is_mobile).to.equal(false);
            expect(body.request.is_smart_tv).to.equal(false);
            expect(body.request.is_tablet).to.equal(false);
            expect(body.status).to.equal("success");
            expect(body.status_code).to.equal(200);
            expect(body.location.ip).to.equal('137.27.69.73');
            expect(body.location.latitude).to.equal(43.0334);
            expect(body.location.longitude).to.equal(-89.4512);
            expect(body.location.city_name).to.equal('Madison');
            expect(body.location.region_name).to.equal('Wisconsin');
            expect(body.location.region_iso_code).to.equal('WI');
            expect(body.location.postal_code).to.equal('53711');
            expect(body.location.country_name).to.equal('United States');
            expect(body.location.country_iso_code).to.equal('US');
            expect(body.location.continent_name).to.equal('North America');
            expect(body.location.continent_code).to.equal('NA');
            expect(body.timezone.time_zone).to.equal('America/Chicago');
            expect(body.timezone.time_zone_abbr).to.equal('CDT');
            expect(body.timezone.time_zone_offset).to.equal(-21600);
            expect(body.timezone.time_zone_is_dst).to.equal(false);
            expect(body.timezone.time_zone_current_time).to.be.a('string');
            expect(body.security.is_anonymous_proxy).to.equal(false);
            expect(body.security.is_satellite_provider).to.equal(false);
            expect(body.isp.asn).to.equal('20115');
            expect(body.isp.organization).to.equal('CHARTER-NET-HKY-NC - Charter Communications');

            done();
        });
    });


    //TODO: revisit - redis-mock is not working correctly for zrangebyscore for BIG INTs
    /*
    it('valid ipv6 ip parameter in query string should return statusCode 200 and fully formed response', (done) => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": valid_key,
                "ip": process.env.IPV6_IP
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        handler.lookup(event, context, function(err, data) {
            expect(err).to.be.null;
            expect(data.statusCode).to.equal(200);
            const body = JSON.parse(data.body);
            console.log("JSON.stringify(body); " + JSON.stringify(body));
            expect(body.time_elapsed).to.be.a('number');
            expect(body.request.request_id).to.be.a('string');
            expect(body.request.request_ts).to.be.a('string');
            expect(body.request.source_ip).to.equal('8.8.8.8');
            expect(body.request.lookup_ip).to.equal('2001:200:1c0:2000:0:0:0:0');
            expect(body.request.is_desktop).to.equal(false);
            expect(body.request.is_mobile).to.equal(false);
            expect(body.request.is_smart_tv).to.equal(false);
            expect(body.request.is_tablet).to.equal(false);
            expect(body.status).to.equal("success");
            expect(body.status_code).to.equal(200);
            expect(body.location.ip).to.equal('2001:200:1c0:2000:0:0:0:0');
            expect(body.timezone).to.exist;
            expect(body.security).to.exist;
            expect(body.isp).to.exist;
            done();
        });
    });

     */


    /*
    it('cleanup', (done) => {
        test_setup.cleanup(function (err) {
            expect(err).to.be.null;
            done();
        });
    });
    */


});
