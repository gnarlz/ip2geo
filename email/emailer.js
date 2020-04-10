'use strict';

const AWS = require('aws-sdk');
const postmark = require("postmark");

// accountData: {"action":"account.create","ts":"2020-04-09 10:10:27.533000","key":"88af6595-d8b0-45f6-8ec4-6857f481a791","subscription_id":"375f18da-5f1b-43b2-9d1a-3d4127a5febc","email":"test@ip2geo.co","plan_id":"plan_GVK3dbrCJxAEqa","plan_name":"mvp_001","plan_created_at":"2019-11-03 13:30:11.606000","display_name":"MVP","limit":300000,"ratelimit_max":0,"ratelimit_duration":0,"price":19}
exports.sendNewSubscriberEmail = function(accountData) {
    return new Promise((resolve, reject) => {
        console.log("accountData: " + JSON.stringify(accountData));
        Promise.all([getHtmlContent(accountData), getTextContent(accountData)])
            .then((htmlContent, textContent) => {
                return sendEmail(accountData, htmlContent, textContent);
            })
            .catch((error) => {
                console.error("error in promise chain: " + error);
                reject(error);
            })
            .then(() => {
                resolve(null);
            })
    });
};


function getHtmlContent(accountData){
    return new Promise((resolve, reject) => {
        const html_params = {
            Bucket: process.env.HTML_TEMPLATE_BUCKET_NAME,
            Key: process.env.HTML_TEMPLATE_KEY_NAME
        };
        const s3GetObjectPromise = new AWS.S3().getObject(html_params).promise();
        s3GetObjectPromise
            .then((data) => {
                let template = data.Body.toString('ascii');
                //You have subscribed to the {{plan_display_name}} plan. This key is allowed {{monthly_limit}} requests a month. {{rate_limit_details}}
                //<br/> <br/>
                //Your API Key is <span style="font-weight:bold;">{{key}}</span>
                let html_plan_display_name_replacement = template.replace(/{{plan_display_name}}/, accountData.display_name );
                let html_monthly_limit_replacement = html_plan_display_name_replacement.replace(/{{monthly_limit}}/,  Number(accountData.limit).toLocaleString() );
                let html_rate_limit_details_replacement = html_monthly_limit_replacement.replace(/{{rate_limit_details}}/, '');
                let htmlTemplate = html_rate_limit_details_replacement.replace(/{{key}}/, accountData.key);
                resolve(htmlTemplate);
            })
            .catch((error) => {
                console.error("error in getHtmlContent: " + error);
                reject(error);
            })
    });
};
function getTextContent(accountData){
    return new Promise((resolve, reject) => {
        const text_params = {
            Bucket: process.env.TEXT_TEMPLATE_BUCKET_NAME,
            Key: process.env.TEXT_TEMPLATE_KEY_NAME
        };
        const s3GetObjectPromise = new AWS.S3().getObject(text_params).promise();
        s3GetObjectPromise
            .then((data) => {
                let template = data.Body.toString('ascii');
                let text_plan_display_name_replacement = template.replace(/{{plan_display_name}}/, accountData.display_name);
                let text_monthly_limit_replacement = text_plan_display_name_replacement.replace(/{{monthly_limit}}/, Number(accountData.limit).toLocaleString());
                let text_rate_limit_details_replacement = text_monthly_limit_replacement.replace(/{{rate_limit_details}}/, '');
                let textTemplate = text_rate_limit_details_replacement.replace(/{{key}}/, accountData.key);
                resolve(textTemplate);
            })
            .catch((error) => {
                console.error("error in getTextContent: " + error);
                reject(error);
            })
    });
};
function sendEmail(accountData, htmlContent, textContent) {
    return new Promise((resolve, reject) => {
        const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
        const message = {
            From: "support@ip2geo.co",
            To: accountData.email,
            Cc: "support@ip2geo.co",
            ReplyTo: "support@ip2geo.co",
            Subject: "Welcome to ip2geo! Here is your API key",
            HtmlBody: "'" + htmlContent + "'",
            TextBody: textContent,
            TrackOpens: true,
            TrackLinks: "HtmlOnly"
        };
        client.sendEmail(message)
            .then((data) => {
                console.log("SUCCESS sending email: " + JSON.stringify(data));
                resolve(null);
            })
            .catch((error) => {
                console.error("PROBLEM sending email: " + error);
                reject(error);
            })
    });
};
