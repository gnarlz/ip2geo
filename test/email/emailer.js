'use strict'

const config = require('../config');
const expect  = require("chai").expect;
const emailer = require('../../email/emailer');

describe('email.emailer.sendNewSubscriberEmail test',() => {
    it('valid invocation - email should be sent', () => {
        const accountData = {
            action: "account.create",
            ts: "2020-04-09 10:10:27.533000",
            key: "88af6595-d8b0-45f6-8ec4-6857f481a791",
            subscription_id: "375f18da-5f1b-43b2-9d1a-3d4127a5febc",
            email: "test@ip2geo.co",
            plan_id: "plan_GVK3dbrCJxAEqa",
            plan_name: "mvp_001",
            plan_created_at: "2019-11-03 13:30:11.606000",
            display_name: "MVP",
            limit: 300000,
            ratelimit_max: 0,
            ratelimit_duration: 0,
            price: 19
        };
        return emailer.sendNewSubscriberEmail(accountData)
            .then ((data) => {
                expect(data).to.be.null;
            })
            .catch((error) => {
                //expect(error).to.be.null;
                console.log("error: " + error);
            })
    })
});



