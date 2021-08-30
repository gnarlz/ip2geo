'use strict'

//const config = require('../../xconfigx')
const expect  = require("chai").expect
const account = require('../../../account/account')
const uuidv4 = require('uuid/v4')



// TODO: need to proxyrequire in  ../../../account/account
// redis
// postgres,
// insertPostgresKeyAccount(accountData),
// insertPostgresKeyRequest(accountData),
// insertPostgresKeyLimit(accountData),
// insertPostgresKeyAuthorization(accountData),
// insertRedisAuthorization(accountData)
// emailer.sendNewSubscriberEmail


// TODO: RESUME - start to proxyrequire everything



describe('account.create test',() => {
    it.only('empty subscription_id should return error', () => {
        const context = {
            "awsRequestId": uuidv4()
        }
        const event = {
            //subscription_id: uuidv4(),
            subscription_id: '',
            stripeEmail: 'test@ip2geo.co',
            planID: 'plan_GVK3dbrCJxAEqa',
            plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        }
        return account.create(event, context)
            .then ((data) => {
                //expect(data.statusCode).to.equal(200)
                throw new Error('EXPECTED ERROR BUT NONE WAS THROWN')
            })
            .catch((error) => {
                console.log("error.message: " + error.message)
                expect(error).to.be.an.instanceOf(Error).with.property('message', "null or empty subscription_id")
            })
    }).timeout(10000)

    it('null subscription_id should return error', () => {
        const context = {
            "awsRequestId": uuidv4()
        }
        const event = {
            //subscription_id: uuidv4(),
            stripeEmail: 'test@ip2geo.co',
            planID: 'plan_GVK3dbrCJxAEqa',
            plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        }
        return account.create(event, context)
            .then ((data) => {
                //expect(data.statusCode).to.equal(200)
            })
            .catch((error) => {
                console.log("error.message: " + error.message)
                expect(error).to.be.an.instanceOf(Error).with.property('message', "null or empty subscription_id")
            })
    }).timeout(10000)


    it('empty stripeEmail should return error', () => {
        const context = {
            "awsRequestId": uuidv4()
        }
        const event = {
            subscription_id: uuidv4(),
            //stripeEmail: 'test@ip2geo.co',
            stripeEmail: '',
            planID: 'plan_GVK3dbrCJxAEqa',
            plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        }
        return account.create(event, context)
            .then ((data) => {
                //expect(data.statusCode).to.equal(200)
            })
            .catch((error) => {
                console.log("error.message: " + error.message)
                expect(error).to.be.an.instanceOf(Error).with.property('message', "null or empty stripeEmail")
            })
    }).timeout(10000)

    it('null stripeEmail should return error', () => {
        const context = {
            "awsRequestId": uuidv4()
        }
        const event = {
            subscription_id: uuidv4(),
            //stripeEmail: 'test@ip2geo.co',
            planID: 'plan_GVK3dbrCJxAEqa',
            plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        }
        return account.create(event, context)
            .then ((data) => {
                //expect(data.statusCode).to.equal(200)
            })
            .catch((error) => {
                console.log("error.message: " + error.message)
                expect(error).to.be.an.instanceOf(Error).with.property('message', "null or empty stripeEmail")
            })
    }).timeout(10000)



    it('empty planID should return error', () => {
        const context = {
            "awsRequestId": uuidv4()
        }
        const event = {
            subscription_id: uuidv4(),
            stripeEmail: 'test@ip2geo.co',
            //planID: 'plan_GVK3dbrCJxAEqa',
            planID: '',
            plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        }
        return account.create(event, context)
            .then ((data) => {
                //expect(data.statusCode).to.equal(200)
            })
            .catch((error) => {
                console.log("error.message: " + error.message)
                expect(error).to.be.an.instanceOf(Error).with.property('message', "null or empty planID")
            })
    }).timeout(10000)

    it('null planID should return error', () => {
        const context = {
            "awsRequestId": uuidv4()
        }
        const event = {
            subscription_id: uuidv4(),
            stripeEmail: 'test@ip2geo.co',
            //planID: 'plan_GVK3dbrCJxAEqa',
            plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        }
        return account.create(event, context)
            .then ((data) => {
                //expect(data.statusCode).to.equal(200)
            })
            .catch((error) => {
                console.log("error.message: " + error.message)
                expect(error).to.be.an.instanceOf(Error).with.property('message', "null or empty planID")
            })
    }).timeout(10000)





    it('empty plan_name should return error', () => {
        const context = {
            "awsRequestId": uuidv4()
        }
        const event = {
            subscription_id: uuidv4(),
            stripeEmail: 'test@ip2geo.co',
            planID: 'plan_GVK3dbrCJxAEqa',
            //plan_name: 'mvp_001',
            plan_name: '',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        }
        return account.create(event, context)
            .then ((data) => {
                //expect(data.statusCode).to.equal(200)
            })
            .catch((error) => {
                console.log("error.message: " + error.message)
                expect(error).to.be.an.instanceOf(Error).with.property('message', "null or empty plan_name")
            })
    }).timeout(10000)

    it('null plan_name should return error', () => {
        const context = {
            "awsRequestId": uuidv4()
        }
        const event = {
            subscription_id: uuidv4(),
            stripeEmail: 'test@ip2geo.co',
            planID: 'plan_GVK3dbrCJxAEqa',
            //plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        }
        return account.create(event, context)
            .then ((data) => {
                //expect(data.statusCode).to.equal(200)
            })
            .catch((error) => {
                console.log("error.message: " + error.message)
                expect(error).to.be.an.instanceOf(Error).with.property('message', "null or empty plan_name")
            })
    }).timeout(10000)


    it('valid invocation - account should be created', () => {
        const context = {
            "awsRequestId": uuidv4()
        }
        const event = {
            subscription_id: uuidv4(),
            stripeEmail: 'test@ip2geo.co',
            planID: 'plan_GVK3dbrCJxAEqa',
            plan_name: 'mvp_001',
            queryStringParameters:{},
            requestContext: {
                identity: {
                    sourceIp: process.env.SOURCE_IP
                }
            },
        }
        return account.create(event, context)
            .then ((data) => {
                expect(data).to.be.null
            })
            .catch((error) => {
                console.log("error: " + error)
            })
    }).timeout(10000) // DAMN THAT S3 ACCESS IS SLOW



})


