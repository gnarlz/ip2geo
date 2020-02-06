'use strict'

const config = require('../config');
const expect  = require("chai").expect;
const parse = require('../../lib/parse');


describe('parse.args test',() => {


    it("no event.queryStringParameters.ip should return parsed args in an []", (done) => {
        const event = {
            queryStringParameters:{
                key: process.env.VALID_KEY
            },
            requestContext:{
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            }
        };

        parse.args(event, function(err, data) {
            expect(err).to.be.null;
            console.log("JSON.stringify(data): " + JSON.stringify(data));
            expect(data).to.be.an('array').to.have.lengthOf(2).to.eql(['8.8.8.8', process.env.VALID_KEY]);
            done();
        });
    });




    it("no event.queryStringParameters.key should return error", (done) => {
        const event = {
            queryStringParameters:{
                "ip": process.env.IPV4_IP
            },
            requestContext:{
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            }
        };

        parse.args(event, function(err, data) {
            expect(err).to.be.an.instanceOf(Error).with.property('message', "No API Key included in the request");
            expect(err).to.be.an.instanceOf(Error).with.property('code', 400);
            done();
        });
    });



    it("valid invocation - should return parsed args in an []", (done) => {
        const event = {
            queryStringParameters:{
                "ip": process.env.IPV4_IP,
                "key": process.env.VALID_KEY
            },
            requestContext:{
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            }
        };
        parse.args(event, function(err, data) {
            expect(err).to.be.null;
            console.log("JSON.stringify(data): " + JSON.stringify(data));
            expect(data).to.be.an('array').to.have.lengthOf(2).to.eql([process.env.IPV4_IP, process.env.VALID_KEY]);
            done();
        });
    });


});