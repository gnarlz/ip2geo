'use strict';

const AWS = require('aws-sdk');
const async = require('async');
const postmark = require("postmark");

exports.sendNewSubscriberEmail = function(account_data,  callback) {

    let htmlTemplate;
    let textTemplate;

    async.waterfall(
        [
            function getTemplates(callback) {
                async.parallel(
                    [
                        function getHtmlTemplate(callback){
                            const s3 = new AWS.S3();
                            const html_params = {
                                Bucket: 'ip2geo-email-templates',
                                Key: 'ip2geo-new-subscriber-html-template.txt'};

                            s3.getObject(html_params, function(err, data) {
                                if (err) {
                                    console.log(err, err.stack);
                                    callback(err);
                                } else{
                                    let template = data.Body.toString('ascii');
                                    /*
                                    You have subscribed to the {{plan_display_name}} plan. This key is allowed {{monthly_limit}} requests a month. {{rate_limit_details}}
                                    <br/> <br/>
                                    Your API Key is <span style="font-weight:bold;">{{key}}</span>
                                     */
                                    let html_plan_display_name_replacement = template.replace(/{{plan_display_name}}/, account_data.display_name );
                                    let html_monthly_limit_replacement = html_plan_display_name_replacement.replace(/{{monthly_limit}}/,  Number(account_data.limit).toLocaleString() );
                                    let html_rate_limit_details_replacement = html_monthly_limit_replacement.replace(/{{rate_limit_details}}/, '');
                                    htmlTemplate = html_rate_limit_details_replacement.replace(/{{key}}/, account_data.key);
                                    //console.log("htmlTemplate: " + htmlTemplate);
                                    callback(null);
                                }
                            });
                        },


                        function getTextTemplate(callback){
                            const s3 = new AWS.S3();
                            const html_params = {
                                Bucket: 'ip2geo-email-templates',
                                Key: 'ip2geo-new-subscriber-text-template.txt'};

                            s3.getObject(html_params, function(err, data) {
                                if (err) {
                                    console.log(err, err.stack);
                                    callback(err);
                                } else{
                                    let template = data.Body.toString('ascii');

                                    let text_plan_display_name_replacement = template.replace(/{{plan_display_name}}/, account_data.display_name);
                                    let text_monthly_limit_replacement = text_plan_display_name_replacement.replace(/{{monthly_limit}}/, Number(account_data.limit).toLocaleString());
                                    let text_rate_limit_details_replacement = text_monthly_limit_replacement.replace(/{{rate_limit_details}}/, '');
                                    textTemplate = text_rate_limit_details_replacement.replace(/{{key}}/, account_data.key);
                                    //console.log("textTemplate: " + textTemplate);
                                    callback(null);
                                }
                            });
                        }
                    ],
                    function (err, results) {
                        if(err){
                            console.log ("async.parallel error: " + err);
                            callback(err);
                        }
                        else{
                            console.log ("async.parallel success: ");
                            callback (null);
                        }

                    })},


            function sendEmail(callback) {

                const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);
                client.sendEmail(
                    {
                        From: "support@ip2geo.co",
                        To: account_data.email,
                        Cc: "support@ip2geo.co",
                        ReplyTo: "support@ip2geo.co",
                        Subject: "Welcome to ip2geo! Here is your API key",
                        HtmlBody: htmlTemplate,
                        TextBody: textTemplate,
                        TrackOpens: true,
                        TrackLinks: "HtmlOnly"
                    }
                    , function(err, data) {
                        if(err){
                            console.error("PROBLEM sending email: " + err);
                            callback(err);
                        } else {
                            console.log("SUCCESS sending email: " + JSON.stringify(data));
                            callback(null);
                        }
                    });
            }

        ],
        function (err, results) {
            if(err){
                console.log ("async waterfall error: " + err);
                callback(err);
            }
            else{
                console.log ("async waterfall success: ");
                callback(null);
            }

        })
}
