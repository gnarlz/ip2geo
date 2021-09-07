'use strict'

const config = require('../xconfigx');
//const expect  = require("chai").expect;
const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const handler = require('../../handler');
const uuidv4 = require('uuid/v4');
//const { v4: uuidv4 } = require('uuid')

describe('handler.lookup test',() => {

    /*
    ==========================================================================================
    =========================================  TESTS =========================================
    ==========================================================================================

    no key parameter in query string
    empty key parameter in query string
    invalid key parameter in query string (key not uuid)
    invalid key parameter in query string (key uuid not in redis)
    revoked key parameter in query string
    exceeded plan limit key parameter in query string
    exceeded rate limit key parameter in query string
    payment past due key parameter in query string
    account terminated key parameter in query string
    free trial ended key parameter in query string

    no ip parameter in query string
    empty ip parameter in query string
    invalid ip parameter (i.e. foo) in query string
    invalid ip parameter (i.e. 333.333.333.333) in query string
    valid ipv4 ip parameter in query string
    valid ipv6 ip parameter in query string

    */


    it('no key parameter in query string should return valid response with statusCode 400 and error.message value', () => {
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
        return handler.lookup(event, context)
            .then((data) => {
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(400);
                const body = JSON.parse(data.body);
                expect(body.status_code).to.equal(400);
                expect(body.error.message).to.equal("No API Key included in the request");
            })
    });

    it('empty key parameter in query string should return valid response with statusCode 400 and error.message value', () => {
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
        return handler.lookup(event, context)
            .then((data) => {
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(400);
                const body = JSON.parse(data.body);
                expect(body.status_code).to.equal(400);
                expect(body.error.message).to.equal("No API Key included in the request");
            })
    });

    it('invalid key parameter (not a uuid) in query string should return valid response with statusCode 400 and error.message value', () => {
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
        return handler.lookup(event, context)
            .then((data) => {
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(400);
                const body = JSON.parse(data.body);
                expect(body.status_code).to.equal(400);
                expect(body.error.message).to.equal("Invalid API Key included in the request: foo");
            })
    });

    it('invalid key parameter (uuid but not a valid key) in query string should return valid response with statusCode 400 and error.message value', () => {
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
        return handler.lookup(event, context)
            .then((data) => {
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(401);
                const body = JSON.parse(data.body);
                expect(body.status_code).to.equal(401);
                expect(body.error.message).to.equal("API Key is unrecognized: " + invalid_key);
            })
    });

    it('revoked key parameter in query string should return valid response with statusCode 403 and error.message value', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": process.env.REVOKED_KEY
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        return handler.lookup(event, context)
            .then((data) => {
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(403);
                const body = JSON.parse(data.body);
                expect(body.status_code).to.equal(403);
                expect(body.error.message).to.equal("Your API key has been revoked due to abuse. Please contact support@ip2geo.co to resolve this issue." );
            })
    });

    it('exceeded plan limit key parameter in query string should return valid response with statusCode 403 and error.message value', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": process.env.EXCEEDED_PLAN_LIMIT_KEY
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        return handler.lookup(event, context)
            .then((data) => {
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(403);
                const body = JSON.parse(data.body);
                expect(body.status_code).to.equal(403);
                expect(body.error.message).to.equal("Your API key has been suspended because you have exceeded your plans monthly request limit. Please contact support@ip2geo.co to resolve this issue." );
            })
    });

    it('exceeded rate limit key parameter in query string should return valid response with statusCode 403 and error.message value', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": process.env.EXCEEDED_RATE_LIMIT_KEY
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        return handler.lookup(event, context)
            .then((data) => {
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(403);
                const body = JSON.parse(data.body);
                expect(body.status_code).to.equal(403);
                expect(body.error.message).to.equal("Your API key has been suspended because you have exceeded the rate limit. Please contact support@ip2geo.co to resolve this issue." );
            })
    });

    it('payment past due key parameter in query string should return valid response with statusCode 403 and error.message value', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": process.env.PAYMENT_PAST_DUE__KEY
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        return handler.lookup(event, context)
            .then((data) => {
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(403);
                const body = JSON.parse(data.body);
                expect(body.status_code).to.equal(403);
                expect(body.error.message).to.equal("Your API key has been suspended because your account payment is past due. Please contact support@ip2geo.co to resolve this issue." );
            })
    });

    it('account terminiated key parameter in query string should return valid response with statusCode 403 and error.message value', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": process.env.ACCOUNT_TERMINATED__KEY
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        return handler.lookup(event, context)
            .then((data) => {
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(403);
                const body = JSON.parse(data.body);
                expect(body.status_code).to.equal(403);
                expect(body.error.message).to.equal("Your API key has been suspended because your account has been terminated. Please contact support@ip2geo.co to resolve this issue." );
            })
    });

    it('free trial ended key parameter in query string should return valid response with statusCode 403 and error.message value', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": process.env.FREE_TRIAL_ENDED_KEY
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        return handler.lookup(event, context)
            .then((data) => {
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(403);
                const body = JSON.parse(data.body);
                expect(body.status_code).to.equal(403);
                expect(body.error.message).to.equal("Your API key has been suspended because your free trial has ended. Please contact support@ip2geo.co to resolve this issue." );
            })
    });

    it('no ipv4 ip parameter in query string should return statusCode 200 and fully formed response', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": process.env.VALID_KEY,
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        return  handler.lookup(event, context)
            .then((data) => {
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(200);
                const body = JSON.parse(data.body);
                expect(body.time_elapsed).to.be.a('number');
                expect(body.request.request_id).to.be.a('string');
                expect(body.request.request_ts).to.be.a('string');
                expect(body.request.source_ip).to.equal(process.env.SOURCE_IP);
                expect(body.request.lookup_ip).to.equal(process.env.SOURCE_IP);
                expect(body.request.is_desktop).to.equal(false);
                expect(body.request.is_mobile).to.equal(false);
                expect(body.request.is_smart_tv).to.equal(false);
                expect(body.request.is_tablet).to.equal(false);
                expect(body.status).to.equal("success");
                expect(body.status_code).to.equal(200);
                expect(body.location.ip).to.equal(process.env.SOURCE_IP);
                expect(body.location.latitude).to.equal(37.751);
                expect(body.location.longitude).to.equal(-97.822);
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
            })
    });

    it('empty ipv4 ip parameter in query string should return statusCode 200 and fully formed response', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": process.env.VALID_KEY,
                "ip": ""
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        return  handler.lookup(event, context)
            .then((data) => {
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(200);
                const body = JSON.parse(data.body);
                expect(body.time_elapsed).to.be.a('number');
                expect(body.request.request_id).to.be.a('string');
                expect(body.request.request_ts).to.be.a('string');
                expect(body.request.source_ip).to.equal(process.env.SOURCE_IP);
                expect(body.request.lookup_ip).to.equal(process.env.SOURCE_IP);
                expect(body.request.is_desktop).to.equal(false);
                expect(body.request.is_mobile).to.equal(false);
                expect(body.request.is_smart_tv).to.equal(false);
                expect(body.request.is_tablet).to.equal(false);
                expect(body.status).to.equal("success");
                expect(body.status_code).to.equal(200);
                expect(body.location.ip).to.equal(process.env.SOURCE_IP);
                expect(body.location.latitude).to.equal(37.751);
                expect(body.location.longitude).to.equal(-97.822);
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
            })
    });


    it('invalid ipv4 ip parameter in query string (foo) should return statusCode 400 and fully formed response', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": process.env.VALID_KEY,
                "ip": "foo"
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        return handler.lookup(event, context)
            .then((data) => {
                console.log(JSON.stringify(data));
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(400);
                const body = JSON.parse(data.body);
                expect(body.status_code).to.equal(400);
                expect(body.error.message).to.equal("Invalid IP Address included in the request: foo");
            })
    });

    it('invalid ipv4 ip parameter in query string (333.333.333.333) should return statusCode 400 and fully formed response', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": process.env.VALID_KEY,
                "ip": "333.333.333.333"
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };
        return handler.lookup(event, context)
            .then((data) => {
                console.log(JSON.stringify(data));
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(400);
                const body = JSON.parse(data.body);
                expect(body.status_code).to.equal(400);
                expect(body.error.message).to.equal("Invalid IP Address included in the request: 333.333.333.333");
            })
    });

    it('valid ipv4 ip parameter in query string should return statusCode 200 and fully formed response', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": process.env.VALID_KEY,
                "ip": process.env.IPV4_IP
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };

        return  handler.lookup(event, context)
            .then((data) => {
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(200);
                const body = JSON.parse(data.body);
                expect(body.time_elapsed).to.be.a('number');
                expect(body.request.request_id).to.be.a('string');
                expect(body.request.request_ts).to.be.a('string');
                expect(body.request.source_ip).to.equal(process.env.SOURCE_IP);
                expect(body.request.lookup_ip).to.equal(process.env.IPV4_IP);
                expect(body.request.is_desktop).to.equal(false);
                expect(body.request.is_mobile).to.equal(false);
                expect(body.request.is_smart_tv).to.equal(false);
                expect(body.request.is_tablet).to.equal(false);
                expect(body.status).to.equal("success");
                expect(body.status_code).to.equal(200);
                expect(body.location.ip).to.equal(process.env.IPV4_IP);
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

            })
    });


    it('valid ipv6 ip parameter in query string should return statusCode 200 and fully formed response', () => {
        const context = {
            "awsRequestId": uuidv4()
        };
        const event = {
            queryStringParameters:{
                "key": process.env.VALID_KEY,
                "ip": process.env.IPV6_IP
            },
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
            headers:{}
        };

        return  handler.lookup(event, context)
            .then((data) => {
                console.log("valid ipv6 handler response: " + JSON.stringify(data));
                expect(data).to.be.not.null;
                expect(data.statusCode).to.equal(200);
                const body = JSON.parse(data.body);
                expect(body.time_elapsed).to.be.a('number');
                expect(body.request.request_id).to.be.a('string');
                expect(body.request.request_ts).to.be.a('string');
                expect(body.request.source_ip).to.equal(process.env.SOURCE_IP);
                expect(body.request.lookup_ip).to.equal(process.env.IPV6_IP);
                expect(body.request.is_desktop).to.equal(false);
                expect(body.request.is_mobile).to.equal(false);
                expect(body.request.is_smart_tv).to.equal(false);
                expect(body.request.is_tablet).to.equal(false);
                expect(body.status).to.equal("success");
                expect(body.status_code).to.equal(200);
                expect(body.location.ip).to.equal(process.env.IPV6_IP);
                expect(body.location.latitude).to.equal(35.5569);
                expect(body.location.longitude).to.equal(139.6444);
                expect(body.location.city_name).to.equal('Yokohama');
                expect(body.location.region_name).to.equal('Kanagawa');
                expect(body.location.region_iso_code).to.equal('14');
                expect(body.location.postal_code).to.equal('223-0061');
                expect(body.location.country_name).to.equal('Japan');
                expect(body.location.country_iso_code).to.equal('JP');
                expect(body.location.continent_name).to.equal('Asia');
                expect(body.location.continent_code).to.equal('AS');
                expect(body.timezone.time_zone).to.equal('Asia/Tokyo');
                expect(body.timezone.time_zone_abbr).to.equal('JST');
                expect(body.timezone.time_zone_offset).to.equal(32400);
                expect(body.timezone.time_zone_is_dst).to.equal(false);
                expect(body.timezone.time_zone_current_time).to.be.a('string');
                expect(body.security.is_anonymous_proxy).to.equal(false);
                expect(body.security.is_satellite_provider).to.equal(false);
                expect(body.isp.asn).to.equal('2500');
                expect(body.isp.organization).to.equal('WIDE-BB WIDE Project');
            })
    });



    // TODO: assign unique testid to each test run, and delete only the data for the testid
    /*
     it('cleanup', (done) => {
        test_setup.cleanup(function (err) {
            expect(err).to.be.null;
            done();
        });
    });
    */


});
